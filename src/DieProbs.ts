import Ability from "src/Ability";

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

  public static fromSkills(critSkill: number, normSkill: number, reroll: Ability) {
    // BEFORE taking ceaseless and relentless into account
    let critHitProb = (7 - critSkill) / 6;
    let normHitProb = Math.max(0, (critSkill - normSkill) / 6); // handle BS=6+ and Lethal=4+
    let failHitProb = 1 - critHitProb - normHitProb;

    // now to take ceaseless and relentless into account...
    // (balanced can not be taken into account at this layer and is handled later)
    if (reroll === Ability.Ceaseless
      || reroll === Ability.Relentless
      || reroll === Ability.CeaselessPlusBalanced
    ) {
      const rerollMultiplier = reroll === Ability.Relentless
        ? 1 + failHitProb
        : 7 / 6;
      critHitProb *= rerollMultiplier;
      normHitProb *= rerollMultiplier;
      failHitProb = 1 - critHitProb - normHitProb;
    }

    return new DieProbs(critHitProb, normHitProb, failHitProb);
  }

  public toCritNormFail(): number[] {
    return [this.crit, this.norm, this.fail];
  }

}
