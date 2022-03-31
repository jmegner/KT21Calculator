export default class ShootOptions {
  public numRounds: number;
  public isFireTeamRules: boolean;

  public constructor(
    numRounds: number = 1,
    isFireTeamRules: boolean = false,
  ) {
    this.numRounds = numRounds;
    this.isFireTeamRules = isFireTeamRules;
  }
}
