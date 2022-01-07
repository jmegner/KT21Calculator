import { factorial, } from 'mathjs';
import _ from "lodash";

import Ability from "src/Ability";
import Attacker from "src/Attacker";
import Defender from "src/Defender";
import DieProbs from "src/DieProbs";
import * as Util from 'src/Util';

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
  numRounds: number = 1,
): Map<number, number> // damage to prob
{
  const attackerSingleDieProbs = attacker.toDieProbs();
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

  const defenderSingleDieProbs = defender.toDieProbs();
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

  // don't add damage=0 stuff until just before multi-round handling
  let damageToProb = new Map<number, number>();

  function addAtkDefScenario(atk: FinalDiceProb, def: FinalDiceProb, extraSaves: number): void {
    const currProb = atk.prob * def.prob;
    const damage = calcDamage(attacker, atk.crits, atk.norms, def.crits, def.norms + extraSaves);

    if (damage > 0) {
      let cumulativeProb = damageToProb.get(damage) ?? 0;
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

  if(defender.usesFnp()) {
    damageToProb = withFnpAppliedToDamages(defender.fnp, damageToProb);
  }

  let positiveDamageProbSum = 0;
  damageToProb.forEach(prob => positiveDamageProbSum += prob);

  if (positiveDamageProbSum < 1) {
    damageToProb.set(0, 1 - positiveDamageProbSum);
  }

  if(numRounds > 1) {
    damageToProb = calcMultiRoundDamage(damageToProb, numRounds);
  }

  return damageToProb;
}

function withFnpAppliedToDamages(
  fnp: number,
  preFnpDmgs: Map<number,number>,
  skipZeroDamage: boolean = true,
): Map<number,number>
{
  const postFnpDmgs = new Map<number,number>();
  const probDamagePersists = (fnp - 1) / 6;

  preFnpDmgs.forEach((preFnpProb, preFnpDmg) => {
    for(let postFnpDmg = skipZeroDamage ? 1 : 0; postFnpDmg <= preFnpDmg; postFnpDmg++) {
      const withinFnpProb = Util.binomialPmf(preFnpDmg, postFnpDmg, probDamagePersists);
      const oldProb = postFnpDmgs.get(postFnpDmg) ?? 0;
      const newProb = oldProb + preFnpProb * withinFnpProb;
      postFnpDmgs.set(postFnpDmg, newProb);
    }
  });

  return postFnpDmgs;
}

function calcMultiRoundDamage(
  dmgsSingleRound: Map<number,number>,
  numRounds: number,
): Map<number, number>
{
  let dmgsCumulative = new Map<number,number>(dmgsSingleRound);

  for(let roundIdx of _.range(1, numRounds)) { // eslint-disable-line
    const dmgsPrevRounds = dmgsCumulative;
    dmgsCumulative = new Map<number,number>();

    for(let [dmgPrevRounds, probPrevRounds] of dmgsPrevRounds) {
      for(let [dmgSingleRound, probSingleRound] of dmgsSingleRound) {
        const dmgCumulative = dmgPrevRounds + dmgSingleRound;
        const probCumulativeOld = dmgsCumulative.get(dmgCumulative) ?? 0;
        const probCumulativeNew = probCumulativeOld + probPrevRounds * probSingleRound;
        dmgsCumulative.set(dmgCumulative, probCumulativeNew);
      }
    }
  }

  return dmgsCumulative;
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
  let prob = calcMultiRollProb(crits, dieProbs.crit, norms, dieProbs.norm, fails, dieProbs.fail);

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
      prob += dieProbs.crit * calcMultiRollProb(crits - 1, dieProbs.crit, norms, dieProbs.norm, fails + 1, dieProbs.fail)
    }

    if (norms > 0) {
      prob += dieProbs.norm * calcMultiRollProb(crits, dieProbs.crit, norms - 1, dieProbs.norm, fails + 1, dieProbs.fail)
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

function calcMultiRollProb(
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

  if (attacker.critDmg >= attacker.normDmg) {
    critSavesCancelCritHits();
    critSavesCancelNormHits();

    if (attacker.critDmg > 2 * attacker.normDmg) {
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

  damage += critHits * attacker.critDmg + normHits * attacker.normDmg;
  return damage;
}

export const exportedForTesting = {
  DieProbs,
  FinalDiceProb,
  calcDamage,
  calcFinalDiceProb,
  calcMultiRoundDamage,
  calcMultiRollProb,
  withFnpAppliedToDamages,
};

