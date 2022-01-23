import FightStrategy from 'src/FightStrategy';


export default class FightOptions {
  public strategyFighterA: FightStrategy;
  public strategyFighterB: FightStrategy;
  public firstFighter: string;
  public numRounds: number;

  public constructor() {
    this.strategyFighterA = FightStrategy.MaxDmgToEnemy;
    this.strategyFighterB = FightStrategy.MaxDmgToEnemy;
    this.firstFighter = 'A';
    this.numRounds = 1;
  }
}
