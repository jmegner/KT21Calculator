import Ability from "./Ability";
import Attacker from "./Attacker";
import Defender from "./Defender";
import Die from "./Die";
import { factorial } from 'mathjs';

class DieProbs {
  public crit: number;
  public norm: number;
  public fail: number;

  public constructor(
    crit: number,
    norm: number,
    fail: number,
  ) {
    this.crit = crit;
    this.norm = norm;
    this.fail = fail;
  }

  public static fromAttacker(attacker: Attacker): DieProbs {
    // BEFORE taking ceaseless and relentless into account
    let failHitProb = (attacker.bs - 1) / 6;
    const critSkill = attacker.critSkill();
    let critHitProb = (7 - critSkill) / 6;
    let normHitProb = (critSkill - attacker.bs) / 6;

    // now to take ceaseless and relentless into account...
    if (attacker.reroll === Ability.Ceaseless || attacker.reroll === Ability.Relentless) {
      const rerollMultiplier = (attacker.reroll === Ability.Ceaseless)
        ? 7 / 6
        : (attacker.bs + 5) / 6;
      critHitProb *= rerollMultiplier;
      normHitProb *= rerollMultiplier;
      failHitProb = 1 - critHitProb - normHitProb;
    }

    return new DieProbs(critHitProb, normHitProb, failHitProb);
  }

  public static fromDefender(defender: Defender): DieProbs {
    const critSaveProb = 1 / 6;
    const normSaveProb = (6 - defender.relevantSave()) / 6;
    const failSaveProb = (defender.relevantSave() - 1) / 6;
    return new DieProbs(
      critSaveProb,
      normSaveProb,
      failSaveProb,
    );
  }
}

class FinalDiceProb {
  public prob: number;
  public crits: number;
  public norms: number;

  public constructor(
    prob: number,
    crits: number,
    norms: number,
  ) {
    this.prob = prob;
    this.crits = crits;
    this.norms = norms;
  }
}

export function calcDamageProbabilities(
  attacker: Attacker,
  defender: Defender,
): Map<number, number> // damage to prob
{
  const attackerSingleDieProbs = DieProbs.fromAttacker(attacker);
  let attackerFinalDiceProbs: FinalDiceProb[] = [];

  for (let crits = 0; crits <= attacker.attacks; crits++) {
    for (let norms = 0; norms <= attacker.attacks - crits; norms++) {
      const fails = attacker.attacks - crits - norms;

      const finalDiceProb = calcFinalDiceProb(
        attackerSingleDieProbs,
        crits,
        norms,
        fails,
        attacker.reroll === Ability.Balanced,
        attacker.rending,
        attacker.starfire,
      );

      if (finalDiceProb.prob > 0) {
        attackerFinalDiceProbs.push(finalDiceProb);
      }
    }
  }

  const defenderSingleDieProbs = DieProbs.fromDefender(defender);
  const defenderFinalDiceProbs: FinalDiceProb[] = [];
  const defenderFinalDiceProbsWithPx: FinalDiceProb[] = [];

  const numDefDiceWithoutPx = defender.usesInvulnSave() ? defender.defense : defender.defense - attacker.apx;
  const coverSaves = (numDefDiceWithoutPx > 0 && defender.cover) ? 1 : 0;
  const numDefRollsWithoutPx = numDefDiceWithoutPx - coverSaves;

  // for Px not triggered/relevant
  for (let crits = 0; crits <= numDefRollsWithoutPx; crits++) {
    for (let norms = 0; norms <= numDefRollsWithoutPx - crits; norms++) {
      const fails = numDefRollsWithoutPx - crits - norms;
      const finalDiceProb = calcFinalDiceProb(
        defenderSingleDieProbs,
        crits,
        norms,
        fails,
        defender.chitin,
      );

      if (finalDiceProb.prob > 0) {
        defenderFinalDiceProbs.push(finalDiceProb);
      }
    }
  }

  // if APx > Px, then ignore Px
  const effectivePx = attacker.apx >= attacker.px ? 0 : attacker.px;
  const pxIsRelevant = effectivePx > 0 && !defender.usesInvulnSave();
  let coverSavesWithPx = 0;

  // for Px triggered and relevant
  if (pxIsRelevant) {
    const numDefDiceWithPx = defender.defense - effectivePx;
    coverSavesWithPx = (numDefDiceWithPx > 0 && defender.cover) ? 1 : 0;
    const numDefRollsWithPx = numDefDiceWithPx - coverSavesWithPx;

    for (let crits = 0; crits <= numDefRollsWithPx; crits++) {
      for (let norms = 0; norms <= numDefRollsWithPx - crits; norms++) {
        const fails = numDefRollsWithPx - crits - norms;
        const finalDiceProb = calcFinalDiceProb(
          defenderSingleDieProbs,
          crits,
          norms,
          fails,
          defender.chitin,
        );

        if (finalDiceProb.prob > 0) {
          defenderFinalDiceProbsWithPx.push(finalDiceProb);
        }
      }
    }
  }

  // don't add damage=0 stuff until very end
  let damageToProb = new Map<number, number>();

  function addAtkDefScenario(atk: FinalDiceProb, def: FinalDiceProb, extraSaves: number): void {
    const currProb = atk.prob * def.prob;
    const damage = calcDamage(attacker, atk.crits, atk.norms, def.crits, def.norms + extraSaves);

    if (damage > 0) {
      let cumulativeProb = damageToProb.get(damage);

      if (cumulativeProb === undefined) {
        cumulativeProb = 0;
      }

      cumulativeProb += currProb;
      damageToProb.set(damage, cumulativeProb);
    }
  }

  for (const atk of attackerFinalDiceProbs) {
    if (atk.crits + atk.norms > 0) {
      if (pxIsRelevant && atk.crits > 0) {
        for (const def of defenderFinalDiceProbsWithPx) {
          addAtkDefScenario(atk, def, coverSavesWithPx);
        }
      }
      else {
        for (const def of defenderFinalDiceProbs) {
          addAtkDefScenario(atk, def, coverSaves);
        }
      }
    }
  }

  let positiveDamageProbSum = 0;
  damageToProb.forEach(prob => positiveDamageProbSum += prob);
  damageToProb.set(0, 1 - positiveDamageProbSum);

  return damageToProb;
}

function calcFinalDiceProb(
  dieProbs: DieProbs,
  crits: number,
  norms: number,
  fails: number,
  balancedOrChitin: boolean,
  rending: boolean = false,
  starfire: boolean = false,
): FinalDiceProb {
  let prob = multirollProbability(crits, dieProbs.crit, norms, dieProbs.norm, fails, dieProbs.fail);

  // there are multiple ways to get to this {crits,norms,fails} via OriginalRoll + BalancedRoll
  if (balancedOrChitin) {
    // if have {c,n,f}, then could be because...
    //    was {c,n,f=0} and no balance roll
    //    was {c,n,f>0} then balanced-rolled f
    //    was {c-1,n,f+1} then balanced-rolled c
    //    was {c,n-1,f+1} then balanced-rolled n

    if (fails > 0) {
      prob *= dieProbs.fail;
    }
    // else "no fails" means start out with probability of original roll

    if (crits > 0) {
      prob += dieProbs.crit * multirollProbability(crits - 1, dieProbs.crit, norms, dieProbs.norm, fails + 1, dieProbs.fail)
    }

    if (norms > 0) {
      prob += dieProbs.norm * multirollProbability(crits, dieProbs.crit, norms - 1, dieProbs.norm, fails + 1, dieProbs.fail)
    }
  }

  if (rending) {
    if (crits > 0 && norms > 0) {
      crits++;
      norms--;
    }
  }

  if (starfire) {
    if (crits > 0 && fails > 0) {
      norms++;
      fails--;
    }
  }

  return new FinalDiceProb(prob, crits, norms);
}

function multirollProbability(
  numCrits: number,
  probCrit: number,
  numNorms: number,
  probNorm: number,
  numFails: number,
  probFail: number,
) {
  const prob
    = Math.pow(probCrit, numCrits)
    * Math.pow(probNorm, numNorms)
    * Math.pow(probFail, numFails)
    * factorial(numCrits + numNorms + numFails)
    / factorial(numCrits)
    / factorial(numNorms)
    / factorial(numFails)
    ;
  return prob;
}

function calcDamage(
  attacker: Attacker,
  critHits: number,
  normHits: number,
  critSaves: number,
  normSaves: number,
): number {
  // possible TODO: memoization of results indexed by [crit > norm][hits and saves]
  let damage = critHits * attacker.mwx;

  const numNormalSavesToCancelCritHit = 2;

  function critSavesCancelCritHits() {
    const numCancels = Math.min(critSaves, critHits);
    critSaves -= numCancels;
    critHits -= numCancels;
  }
  function critSavesCancelNormHits() {
    const numCancels = Math.min(critSaves, normHits);
    critSaves -= numCancels;
    normHits -= numCancels;
  }
  function normSavesCancelNormHits() {
    const numCancels = Math.min(normSaves, normHits);
    normSaves -= numCancels;
    normHits -= numCancels;
  }
  function normSavesCancelCritHits() {
    const numCancels = Math.min((normSaves / numNormalSavesToCancelCritHit) >> 0, critHits);
    normSaves -= numCancels * numNormalSavesToCancelCritHit;
    critHits -= numCancels;
  }

  if (attacker.criticalDamage >= attacker.normalDamage) {
    critSavesCancelCritHits();
    critSavesCancelNormHits();

    if (attacker.criticalDamage > 2 * attacker.normalDamage) {
      normSavesCancelCritHits();
      normSavesCancelNormHits();
    }
    else {
      // with norm saves, you prefer to cancel norm hits, but you want to avoid
      // cancelling all norm hits and being left over with >=1 crit hit and 1 normal save;
      // in that case, you should have cancelled 1 crit hit before cancelling norm hits;
      if (normSaves > normHits && normSaves >= numNormalSavesToCancelCritHit && critHits > 0) {
        normSaves -= numNormalSavesToCancelCritHit;
        critHits--;
      }

      normSavesCancelNormHits();
      normSavesCancelCritHits();
    }
  }
  else {
    normSavesCancelNormHits();
    critSavesCancelNormHits();
    critSavesCancelCritHits();
    normSavesCancelCritHits();
  }

  damage += critHits * attacker.criticalDamage + normHits * attacker.normalDamage;
  return damage;
}

export const exportedForTesting = {
  DieProbs,
  FinalDiceProb,
  calcFinalDiceProb,
  multirollProbability,
  calcDamage,
};