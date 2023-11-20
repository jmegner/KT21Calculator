export class CombatOptions {
  public numSimulations: number;
  public numRounds: number;
  public attackerCanBeDamaged: boolean;

  public constructor(
    numSimulations: number = 100,
    numRounds: number = 1,
    attackerCanBeDamaged: boolean = false
  ) {
    this.numSimulations = numSimulations;
    this.numRounds = numRounds;
    this.attackerCanBeDamaged = attackerCanBeDamaged;
  }

}
