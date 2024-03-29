import { clone } from "lodash";
import Model from "src/Model";
import FightStrategy from 'src/FightStrategy';
import FightChoice from "src/FightChoice";
import Ability from "./Ability";

export default class FighterState {
  public profile: Model;
  public crits: number;
  public norms: number;
  public strategy: FightStrategy;
  public currentWounds: number;
  public hasDoneStun: boolean;
  public hasStruck: boolean;
  public hasDoneMurderousEntrance: boolean;

  public constructor(
    profile: Model,
    crits: number,
    norms: number,
    strategy: FightStrategy,
    currentWounds: number = -1,
    hasDoneStun: boolean = false,
    hasDoneHammerhand: boolean = false,
    hasDoneMurderousEntrance: boolean = false,
  ) {
    this.profile = profile;
    this.crits = crits;
    this.norms = norms;
    this.strategy = strategy;
    this.currentWounds = currentWounds > 0 ? currentWounds : this.profile.wounds;
    this.hasDoneStun = hasDoneStun;
    this.hasStruck = hasDoneHammerhand;
    this.hasDoneMurderousEntrance = hasDoneMurderousEntrance;
  }

  public successes() {
    return this.crits + this.norms;
  }

  public applyDmg(dmg: number) {
    this.currentWounds = Math.max(0, this.currentWounds - dmg);
  }

  public isFullHealth() {
    return this.currentWounds === this.profile.wounds;
  }

  public hammerhandDmg(
    crits: number | undefined = undefined,
    norms: number | undefined = undefined,
  ) {
    crits = crits || this.crits;
    norms = norms || this.norms;
    return this.profile.abilities.has(Ability.Hammerhand)
      && !this.hasStruck
      && (crits > 0 || norms > 0)
      ? 1 : 0;
  }

  public possibleDmg(crits: number, norms: number): number {
    return this.hammerhandDmg(crits, norms) + this.profile.possibleDmg(crits, norms);
  }

  public totalDmg(): number {
    return this.possibleDmg(this.crits, this.norms);
  }

  public nextDmg(): number {
    let dmg = this.hammerhandDmg();

    if (this.crits > 0) {
      dmg += this.profile.critDmg;

      if (this.profile.has(Ability.MurderousEntrance) && !this.hasDoneMurderousEntrance) {
        dmg += this.profile.critDmg;
      }
    }
    else if (this.norms > 0) {
      dmg += this.profile.normDmg;
    }

    return dmg;
  }

  public nextStrike(): FightChoice {
    return this.crits > 0 ? FightChoice.CritStrike : FightChoice.NormStrike;
  }

  public withStrategy(strategy: FightStrategy): FighterState {
    const newFighterState = clone(this);
    newFighterState.strategy = strategy;
    return newFighterState;
  }
}
