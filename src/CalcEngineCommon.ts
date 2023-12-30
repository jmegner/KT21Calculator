import { max, range, } from 'lodash';
import { factorial, } from 'mathjs';

import Ability from "src/Ability";
import Attacker from "src/Attacker";
import DieProbs from "src/DieProbs";
import FinalDiceProb from 'src/FinalDiceProb';
import { addToMapValue, upTo } from 'src/Util';

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
  else if (reroll === Ability.Tedious) {
    prob = calcFinalDiceProbTedious(dieProbs, crits, norms, fails);
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
  finalCrits: number,
  finalNorms: number,
  finalFails: number,
  balancedCount: number,
): number {
  let prob = 0;

  const minRerolls = Math.min(finalFails, balancedCount);
  const maxRerolls = balancedCount;

  // NOTE: variable names like "rerolledCrits" are how many originally-failed dice were rerolled and became crits

  for(const rerolls of upTo(minRerolls, maxRerolls)) {
    for(const rerolledCrits of upTo(Math.min(finalCrits, rerolls))) {
      // you can't have so few new norms that you have more orig fails than final fails
      const minRerolledNorms = Math.max(0, rerolls - rerolledCrits - finalFails);
      // firstly, can't have more new norms than final norms
      // secondly, can't have more new crits and norms than rerolls
      // and the ternary is to prevent (rerolls < balancedFactor && rerolls < origFails)
      const maxRerolledNorms = Math.min(
        finalNorms,
        rerolls - rerolledCrits - (rerolls < balancedCount ? finalFails : 0));
      for(const rerolledNorms of upTo(minRerolledNorms, maxRerolledNorms)) {
        const rerolledFails = rerolls - rerolledCrits - rerolledNorms;
        const origCrits = finalCrits - rerolledCrits;
        const origNorms = finalNorms - rerolledNorms;
        const origFails = finalFails + rerolledNorms + rerolledCrits;

        const preBalancedProb = calcMultiRollProb(
          dieProbs,
          origCrits,
          origNorms,
          origFails);
        const balancedRollsProb = calcMultiRollProb(
          dieProbs,
          rerolledCrits,
          rerolledNorms,
          rerolledFails);
        prob += preBalancedProb * balancedRollsProb;
      }
    }
  }

  return prob;
}

export function calcFinalDiceProbTedious(
  dieProbs: DieProbs,
  finalCrits: number,
  finalNorms: number,
  finalFails: number,
): number {
  let prob = 0;
  const numFailFaces = Math.round(dieProbs.fail * 6);
  const numDice = finalCrits + finalNorms + finalFails;

  // given finalFails, the lowest-reroll scenario is evenly-split-as-possible fails
  const minRerolls = Math.ceil(finalFails / numFailFaces);
  const maxRerolls = numDice;

  for(const rerolls of upTo(minRerolls, maxRerolls)) {
    for(const rerolledCrits of upTo(Math.min(finalCrits, rerolls))) {
      // you can't have so few new norms that you have more orig fails than final fails
      const minRerolledNorms = Math.max(0, rerolls - rerolledCrits - finalFails);
      // firstly, can't have more new norms than final norms
      // secondly, can't have more new crits and norms than rerolls
      const maxRerolledNorms = Math.min(
        finalNorms,
        rerolls - rerolledCrits);
      for(const rerolledNorms of upTo(minRerolledNorms, maxRerolledNorms)) {
        const rerolledFails = rerolls - rerolledCrits - rerolledNorms;
        const origCrits = finalCrits - rerolledCrits;
        const origNorms = finalNorms - rerolledNorms;
        const origFails = finalFails + rerolledNorms + rerolledCrits;;
        const probOfNumRerolls = getProbOfNumTediousRerolls(numFailFaces, origFails, rerolls);

        const preRerollProb = calcMultiRollProb(
          dieProbs,
          origCrits,
          origNorms,
          origFails);
        const rerollProb = calcMultiRollProb(
          dieProbs,
          rerolledCrits,
          rerolledNorms,
          rerolledFails);
        prob += probOfNumRerolls * preRerollProb * rerollProb;
      }
    }
  }
  return prob;
}

// indices in order: number of fail types (from BS), number of original fails, number of rerolls
// final value is probability of that many rerolls given the other info
const TediousRerollCountProbs = new Map<number, Map<number, Array<number>>>();

export function getProbOfNumTediousRerolls(
  numFailTypes: number,
  numOrigFails: number,
  numRerolls: number,
): number {
  let probsForNumFailType = TediousRerollCountProbs.get(numFailTypes);

  if(probsForNumFailType === undefined) {
    probsForNumFailType = new Map<number, Array<number>>();
    TediousRerollCountProbs.set(numFailTypes, probsForNumFailType);
  }

  let rerollCountProbs = probsForNumFailType.get(numOrigFails);

  if(rerollCountProbs !== undefined) {
    return rerollCountProbs[numRerolls];
  }

  rerollCountProbs = new Array<number>(numOrigFails + 1).fill(0);
  probsForNumFailType.set(numOrigFails, rerollCountProbs);

  const failTypeCounts = new Array<number>(numFailTypes).fill(0);
  failTypeCounts[0] = numOrigFails;

  // the overall probability is the following multiplicative factors...
  // probability of rolling each fail type in a particular order
  //   numFailTypes^-numOrigFails
  // number of permutations of how orig fails were rolled
  //   fact(numOrigFails) / fact(numFailType1) / fact(numFailType2) / ...
  // number of permutations of counts of fail types
  //   fact(numFailTypes) / fact(how many fail types had 0 dice) / fact(how many fail types had 1 dice) / ...

  const commonProbFactor
    = Math.pow(numFailTypes, -numOrigFails) // chance of rolling each fail type in a particular order
    * factorial(numOrigFails) // from permutations of how orig fails were rolled
    * factorial(numFailTypes); // from permutations of counts of fail types

  do {
    let divisor = 1;
    for(const failTypeCount of failTypeCounts) {
      divisor *= factorial(failTypeCount);
    }

    const failTypeCountHistogram = calcHistogramArray(failTypeCounts);
    for(const numFailTypesWithCertainNumDice of failTypeCountHistogram) {
      divisor *= factorial(numFailTypesWithCertainNumDice);
    }

    const maxFailTypeCount = max(failTypeCounts)!; // how many rerolls we get
    rerollCountProbs[maxFailTypeCount] += commonProbFactor / divisor;
  } while(changeToNextDescendingSequenceWithSameSum(failTypeCounts));

  return rerollCountProbs[numRerolls];
}

export function calcHistogramArray(vals: number[]): number[] {
  const histogram = new Array<number>(max(vals)! + 1).fill(0);
  for(const val of vals) {
    histogram[val]++;
  }
  return histogram;
}

// examples with length 3 and sum 9 ...
// [9, 0, 0] -> [8, 1, 0]
// [8, 1, 0] -> [7, 2, 0]
// [5, 4, 0] -> [7, 1, 1]
// [7, 1, 1] -> [6, 2, 1]
// [4, 3, 2] -> [3, 3, 3]
// returns true if there was a next sequence, false if not
export function changeToNextDescendingSequenceWithSameSum(vals: number[]): boolean {
  // optimization of common case
  if(vals[1] + 1 < vals[0]) {
    vals[0]--;
    vals[1]++;
    return true;
  }
  // `i` is index we are hoping to increment
  for(let i = 2; i < vals.length; i++) {
    // can we increment at i?
    if(vals[i] < vals[i - 1] && vals[i] + 1 < vals[0]) {
      const commonVal = ++vals[i]; // then increment at i
      // and "lopside" everything before i; so vals[0] is big and vals[1..i-1] == vals[i]
      let val0Increment = -1;
      for(let j = 1; j < i; j++) {
        val0Increment += vals[j] - commonVal;
        vals[j] = commonVal;
      }
      vals[0] += val0Increment;
      return true;
    }
  }
  return false;
}

export function calcMultiRoundDamage(
  dmgsSingleRound: Map<number,number>,
  numRounds: number,
): Map<number, number>
{
  let dmgsCumulative = new Map<number,number>(dmgsSingleRound);

  // eslint-disable-next-line
  for(let _ of range(numRounds - 1)) {
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
