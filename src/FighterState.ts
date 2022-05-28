import { clone } from "lodash";
import Attacker from "src/Attacker";
import FightStrategy from 'src/FightStrategy';
import FightChoice from "src/FightChoice";

export default class FighterState {
  public profile: Attacker;
  public crits: number;
  public norms: number;
  public strategy: FightStrategy;
  public currentWounds: number;
  public hasDoneStun: boolean;
  public hasDoneHammerhand: boolean;

  public constructor(
    profile: Attacker,
    crits: number,
    norms: number,
    strategy: FightStrategy,
    currentWounds: number = -1,
    hasDoneStun: boolean = false,
    hasDoneHammerhand: boolean = false,
  ) {
    this.profile = profile;
    this.crits = crits;
    this.norms = norms;
    this.strategy = strategy;
    this.currentWounds = currentWounds > 0 ? currentWounds : this.profile.wounds;
    this.hasDoneStun = hasDoneStun;
    this.hasDoneHammerhand = hasDoneHammerhand;
  }

  public applyDmg(dmg: number) {
    this.currentWounds = Math.max(0, this.currentWounds - dmg);
  }

  public hammerhandDmg(
    crits: number | undefined = undefined,
    norms: number | undefined = undefined,
  ) {
    crits = crits || this.crits;
    norms = norms || this.norms;
    return this.profile.hammerhand
      && !this.hasDoneHammerhand
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
