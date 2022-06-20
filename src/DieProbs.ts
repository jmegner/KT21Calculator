export default class DieProbs {
  public crit: number;
  public norm: number;
  public fail: number;

  public constructor(
    crit: number,
    norm: number,
    fail: number = -1,
  ) {
    this.crit = crit;
    this.norm = norm;
    this.fail = fail === -1 ? 1 - crit - norm : fail;
  }

  public toCritNormFail(): number[] {
    return [this.crit, this.norm, this.fail];
  }
}
