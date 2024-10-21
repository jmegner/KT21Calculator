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
    // BEFORE taking RerollOnes and relentless into account
    let critHitProb = (7 - critSkill) / 6;
    let normHitProb = Math.max(0, (critSkill - normSkill) / 6); // handle BS=6+ and Lethal=4+
    let failHitProb = 1 - critHitProb - normHitProb;

    // now to take RerollOnes and relentless into account...
    // (balanced can not be taken into account at this layer and is handled later)
    if (reroll === Ability.RerollOnes
      || reroll === Ability.Relentless
      || reroll === Ability.RerollOnesPlusBalanced
    ) {
      const rerollMultiplier = reroll === Ability.Relentless
        ? 1 + failHitProb
        : 7 / 6;
      critHitProb *= rerollMultiplier;
      normHitProb *= rerollMultiplier;
      failHitProb = 1 - critHitProb - normHitProb;
    }
    else if (reroll === Ability.CritFishRelentless) {
      const noncritProb = 1 - critHitProb;
      failHitProb *= noncritProb;
      normHitProb *= noncritProb;
      critHitProb *= 2 - critHitProb;
    }

    return new DieProbs(critHitProb, normHitProb, failHitProb);
  }

  public toCritNormFail(): number[] {
    return [this.crit, this.norm, this.fail];
  }

}
