import { range } from 'lodash';
import { factorial, } from 'mathjs';

import Ability from "src/Ability";
import Attacker from "src/Attacker";
import DieProbs from "src/DieProbs";
import FinalDiceProb from 'src/FinalDiceProb';
import { addToMapValue } from 'src/Util';

export function calcFinalDiceProbsForAttacker(
  attacker: Attacker,
): FinalDiceProb[]
{
  return calcFinalDiceProbs(
    attacker.toDieProbs(),
    attacker.attacks,
    attacker.reroll,
    attacker.autoCrits,
    attacker.autoNorms,
    attacker.normsToCrits,
    attacker.abilities,
  );
}

export function calcFinalDiceProbs(
  singleDieProbs: DieProbs,
  numDice: number,
  reroll: Ability,
  autoCrits: number = 0,
  autoNorms: number = 0,
  normsToCrits: number = 0,
  abilities: Set<Ability> = new Set<Ability>(),
): FinalDiceProb[]
{
  let finalDiceProbs: FinalDiceProb[] = [];

  autoCrits = Math.min(autoCrits, numDice);
  numDice -= autoCrits;
  autoNorms = Math.min(autoNorms, numDice);
  numDice -= autoNorms;

  for (let crits = 0; crits <= numDice; crits++) {
    for (let norms = 0; norms <= numDice - crits; norms++) {
      const fails = numDice - crits - norms;

      const finalDiceProb = calcFinalDiceProb(
        singleDieProbs,
        crits,
        norms,
        fails,
        reroll,
        autoCrits,
        autoNorms,
        normsToCrits,
        abilities,
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
  autoCrits: number = 0,
  autoNorms: number = 0,
  normsToCrits: number = 0,
  abilities: Set<Ability> = new Set<Ability>(),
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

  crits += autoCrits;
  norms += autoNorms;

  if (abilities.has(Ability.FailToNormIfCrit)) {
    if (crits > 0 && fails > 0) {
      norms++;
      fails--;
    }
  }

  if (abilities.has(Ability.FailToNormIfAtLeastTwoSuccesses)) {
    if (crits + norms >= 2 && fails > 0) {
      norms++;
      fails--;
    }
  }

  if (abilities.has(Ability.NormToCritIfAtLeastTwoNorms)) {
    if (norms >= 2) {
      crits++;
      norms--;
    }
  }

  const actualNormToCritPromotions = Math.min(normsToCrits, norms);
  crits += actualNormToCritPromotions;
  norms -= actualNormToCritPromotions;

  if(abilities.has(Ability.EliteModerate)) {
    if(fails > 0) {
      fails--;
      norms++;
    }
    else if(norms > 0) {
      norms--;
      crits++;
    }
  }
  else if(abilities.has(Ability.EliteExtreme)) {
    if(fails > 0) {
      fails--;
      crits++;
    }
    else if(norms > 0) {
      norms--;
      crits++;
    }
  }

  if (abilities.has(Ability.Rending)) {
    if (crits > 0 && norms > 0) {
      crits++;
      norms--;
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

export function calcMultiRoundDamage(
  dmgsSingleRound: Map<number,number>,
  numRounds: number,
): Map<number, number>
{
  let dmgsCumulative = new Map<number,number>(dmgsSingleRound);

  // eslint-disable-next-line
  for(let _ of range(1, numRounds)) {
    const dmgsPrevRounds = dmgsCumulative;
    dmgsCumulative = new Map<number,number>();

    for(let [dmgPrevRounds, probPrevRounds] of dmgsPrevRounds) {
      for(let [dmgSingleRound, probSingleRound] of dmgsSingleRound) {
        const dmgCumulative = dmgPrevRounds + dmgSingleRound;
        addToMapValue(dmgsCumulative, dmgCumulative, probPrevRounds * probSingleRound);
      }
    }
  }

  return dmgsCumulative;
}
