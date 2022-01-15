export default class FinalDiceProb {
  public prob: number;
  public crits: number;
  public norms: number;

  public constructor(
    prob: number,
    crits: number,
    norms: number
  ) {
    this.prob = prob;
    this.crits = crits;
    this.norms = norms;
  }

  public successes(): number {
    return this.crits + this.norms;
  }
}
