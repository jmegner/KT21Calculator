import { factorial, } from 'mathjs';

import Ability from "src/Ability";
import Attacker from "src/Attacker";
import DieProbs from "src/DieProbs";
import FinalDiceProb from 'src/FinalDiceProb';

export function calcFinalDiceProbsForAttacker(
  attacker: Attacker,
): FinalDiceProb[]
{
  return calcFinalDiceProbs(
    attacker.toDieProbs(),
    attacker.attacks,
    attacker.reroll,
    attacker.rending,
    attacker.starfire,
  );
}

export function calcFinalDiceProbs(
  singleDieProbs: DieProbs,
  numDice: number,
  reroll: Ability,
  rending: boolean = false,
  starfire: boolean = false
): FinalDiceProb[]
{
  let finalDiceProbs: FinalDiceProb[] = [];

  for (let crits = 0; crits <= numDice; crits++) {
    for (let norms = 0; norms <= numDice - crits; norms++) {
      const fails = numDice - crits - norms;

      const finalDiceProb = calcFinalDiceProb(
        singleDieProbs,
        crits,
        norms,
        fails,
        reroll,
        rending,
        starfire,
      );

      if (finalDiceProb.prob > 0) {
        finalDiceProbs.push(finalDiceProb);
      }
    }
  }

  return finalDiceProbs;
}

export function calcFinalDiceProb(
  dieProbs: DieProbs,
  crits: number,
  norms: number,
  fails: number,
  reroll: Ability = Ability.None, // really just care if Balanced or CeaselessPlusBalanced
  rending: boolean = false,
  starfire: boolean = false,
): FinalDiceProb
{
  let prob = calcMultiRollProb(crits, dieProbs.crit, norms, dieProbs.norm, fails, dieProbs.fail);

  // there are multiple ways to get to this {crits,norms,fails} via OriginalRoll + BalancedRoll
  if (reroll === Ability.Balanced) {
    // if have {c,n,f}, then could be because...
    //    was {c,n,f=0} and no balance roll
    //    was {c,n,f>0} then balanced-rolled f
    //    was {c-1,n,f+1} then balanced-rolled c
    //    was {c,n-1,f+1} then balanced-rolled n

    // consider possibility of OriginalRollWithSomeFails + FailedBalancedRoll
    // at this point, just need to multiply original roll prob by FailedBalancedRoll prob
    if (fails > 0) {
      prob *= dieProbs.fail;
    }
    // else "no fails" means start out with probability of original roll

    // possibility that BalancedRoll became one of our crits
    if (crits > 0) {
      prob += dieProbs.crit * calcMultiRollProb(crits - 1, dieProbs.crit, norms, dieProbs.norm, fails + 1, dieProbs.fail);
    }

    // possibility that BalancedRoll became one of our norms
    if (norms > 0) {
      prob += dieProbs.norm * calcMultiRollProb(crits, dieProbs.crit, norms - 1, dieProbs.norm, fails + 1, dieProbs.fail);
    }
  }
  else if (reroll === Ability.CeaselessPlusBalanced) {
    const probRollBeforeBalanced = prob;
    // probSingleFailCanNotBeRerolled = (BS - 1) / (7*BS - 13)
    // but, to put it in terms of given ceaseless fail prob: 1/7 + 1/(42*pFail)
    const probSingleFailCanNotBeRerolled = 1 / 7 + 1 / (42 * dieProbs.fail);

    const nonceaselessProbCrit = dieProbs.crit * 6 / 7;
    const nonceaselessProbNorm = dieProbs.norm * 6 / 7;
    const nonceaselessProbFail = 1 - nonceaselessProbCrit - nonceaselessProbNorm;

    // if no fails, then prob we got that before balanced reroll is already calculated

    // 1st, consider prob of PreBalancedRoll+CannotDoBalancedRoll;
    // if CannotDoBalancedRoll is coming from no fails, then we already calculated that;
    // remaining case is we did have fails and all of them were ceaseless-rerolled;
    // this is probPlainRoll * probSingleFailCanNotBeRerolled^NumFails
    if(fails > 0) {
      const conditionalProbNoneCanBeRerolled = Math.pow(probSingleFailCanNotBeRerolled, fails);
      prob *= conditionalProbNoneCanBeRerolled;

      // 2nd, consider prob of PreBalancedRoll+CanDoBalancedRoll+FailedBalancedRoll
      prob += probRollBeforeBalanced * (1 - conditionalProbNoneCanBeRerolled) * nonceaselessProbFail;
    }

    // 3rd, consider prob of PreBalancedRollWithOneLessCrit+CanDoBalancedRoll+CritBalancedRoll
    if(crits > 0) {
      const conditionalProbSomeCanBeRerolled = 1 - Math.pow(probSingleFailCanNotBeRerolled, fails + 1);
      prob += calcMultiRollProb(crits - 1, dieProbs.crit, norms, dieProbs.norm, fails + 1, dieProbs.fail)
        * conditionalProbSomeCanBeRerolled
        * nonceaselessProbCrit;
    }

    // 4th, consider prob of PreBalancedRollWithOneLessNorm+CanDoBalancedRoll+NormBalancedRoll
    if(norms > 0) {
      const conditionalProbSomeCanBeRerolled = 1 - Math.pow(probSingleFailCanNotBeRerolled, fails + 1);
      prob += calcMultiRollProb(crits, dieProbs.crit, norms - 1, dieProbs.norm, fails + 1, dieProbs.fail)
        * conditionalProbSomeCanBeRerolled
        * nonceaselessProbNorm;
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

export function calcMultiRollProb(
  numCrits: number,
  probCrit: number,
  numNorms: number,
  probNorm: number,
  numFails: number,
  probFail: number,
): number
{
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
