import { range } from 'lodash';
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
  let prob = 0

  if (reroll === Ability.Balanced) {
    prob = calcFinalDiceProbBalanced(dieProbs, crits, norms, fails, 1);
  }
  else if (reroll === Ability.DoubleBalanced) {
    prob = calcFinalDiceProbBalanced(dieProbs, crits, norms, fails, 2);
  }
  else {
    prob = calcMultiRollProb(dieProbs, crits, norms, fails);
  }

  if (reroll === Ability.CeaselessPlusBalanced) {
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
      prob += calcMultiRollProb(dieProbs, crits - 1, norms, fails + 1)
        * conditionalProbSomeCanBeRerolled
        * nonceaselessProbCrit;
    }

    // 4th, consider prob of PreBalancedRollWithOneLessNorm+CanDoBalancedRoll+NormBalancedRoll
    if(norms > 0) {
      const conditionalProbSomeCanBeRerolled = 1 - Math.pow(probSingleFailCanNotBeRerolled, fails + 1);
      prob += calcMultiRollProb(dieProbs, crits, norms - 1, fails + 1)
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
  dieProbs: DieProbs,
  numCrits: number,
  numNorms: number,
  numFails: number,
): number
{
  const prob
    = Math.pow(dieProbs.crit, numCrits)
    * Math.pow(dieProbs.norm, numNorms)
    * Math.pow(dieProbs.fail, numFails)
    * factorial(numCrits + numNorms + numFails)
    / factorial(numCrits)
    / factorial(numNorms)
    / factorial(numFails)
    ;
  return prob;
}

export function calcFinalDiceProbBalanced(
  dieProbs: DieProbs,
  crits: number,
  norms: number,
  fails: number,
  balancedFactor: number,
): number {
  let prob = 0;

  for(const rerolls of range(Math.min(fails, balancedFactor), balancedFactor + 1)) {
    for(const balancedCrits of range(Math.min(crits, rerolls) + 1)) {
      for(const balancedNorms of range(Math.min(norms, rerolls - balancedCrits) + 1)) {
        const balancedFails = rerolls - balancedCrits - balancedNorms;
        if(balancedFails > fails) {
          continue;
        }
        // if rerolling less than able, must be because didn't have many fails
        if(rerolls < balancedFactor && balancedCrits + balancedNorms + fails > rerolls) {
          continue;
        }
        const preBalancedProb = calcMultiRollProb(
          dieProbs,
          crits - balancedCrits,
          norms - balancedNorms,
          fails + balancedCrits + balancedNorms);
        const balancedRollsProb = calcMultiRollProb(
          dieProbs,
          balancedCrits,
          balancedNorms,
          balancedFails);
        prob += preBalancedProb * balancedRollsProb;
      }
    }
  }

  return prob;
}