import _ from "lodash";
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

  public constructor(
    profile: Attacker,
    crits: number,
    norms: number,
    strategy: FightStrategy,
    currentWounds: number = -1,
    hasDoneStun: boolean = false,
  ) {
    this.profile = profile;
    this.crits = crits;
    this.norms = norms;
    this.strategy = strategy;
    this.currentWounds = currentWounds > 0 ? currentWounds : this.profile.wounds;
    this.hasDoneStun = hasDoneStun;
  }

  public applyDmg(dmg: number) {
    this.currentWounds = Math.max(0, this.currentWounds - dmg);
  }

  public totalDmg(): number {
    return this.profile.possibleDmg(this.crits, this.norms);
  }

  public nextDmg(): number {
    if (this.crits > 0) {
      return this.profile.critDmg;
    }
    if (this.norms > 0) {
      return this.profile.normDmg;
    }
    return 0;
  }

  public nextStrike(): FightChoice {
    return this.crits > 0 ? FightChoice.CritStrike : FightChoice.NormStrike;
  }

  public withStrategy(strategy: FightStrategy): FighterState {
    const newFighterState = _.clone(this);
    newFighterState.strategy = strategy;
    return newFighterState;
  }
}
