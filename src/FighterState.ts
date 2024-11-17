import { clone } from "lodash";
import Model from "src/Model";
import FightStrategy from 'src/FightStrategy';
import FightChoice from "src/FightChoice";
import Ability from "./Ability";
import { MinCritDmgAfterDurable } from "./KtMisc";

export default class FighterState {
  public profile: Model;
  public crits: number;
  public norms: number;
  public strategy: FightStrategy;
  public currentWounds: number;
  public hasStruck: boolean;
  public hasCritStruck: boolean;

  public constructor(
    profile: Model,
    crits: number,
    norms: number,
    strategy: FightStrategy,
    currentWounds: number = -1,
    hasStruck: boolean = false,
    hasCritStruck: boolean = false,
  ) {
    this.profile = profile;
    this.crits = crits;
    this.norms = norms;
    this.strategy = strategy;
    this.currentWounds = currentWounds > 0 ? currentWounds : this.profile.wounds;
    this.hasStruck = hasStruck;
    this.hasCritStruck = hasCritStruck;
  }

  public successes() {
    return this.crits + this.norms;
  }

  public applyDmg(dmg: number) {
    this.currentWounds = Math.max(0, this.currentWounds - dmg);
  }

  public applyDmgFromStrike(dmg: number, atker: Model, isCrit: boolean) {
    if (isCrit) {
      this.hasCritStruck = true;
    }
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
    return this.profile.abilities.has(Ability.Hammerhand2021)
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

  public nextCritDmgWithDurableAndWithoutHammerhand(enemy: FighterState): number {
    let critDmg = this.profile.critDmg;

    if(enemy.profile.abilities.has(Ability.Durable)
      && !this.hasCritStruck
      && this.profile.critDmg > MinCritDmgAfterDurable
    ) {
      critDmg--;
    }

    return critDmg;
  }

  public nextDmg(enemy: FighterState): number {
    let dmg = 0;

    if (this.crits > 0) {
      dmg += this.nextCritDmgWithDurableAndWithoutHammerhand(enemy);

      if (this.profile.has(Ability.MurderousEntrance2021) && !this.hasCritStruck) {
        dmg += this.profile.critDmg;
      }
    }
    else if (this.norms > 0) {
      dmg += this.profile.normDmg;
    }

    dmg += this.hammerhandDmg();
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
