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
    attacker.reroll === Ability.Balanced,
    attacker.rending,
    attacker.starfire,
  );
}

export function calcFinalDiceProbs(
  singleDieProbs: DieProbs,
  numDice: number,
  balancedOrChitin: boolean = false,
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
        balancedOrChitin,
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
  balancedOrChitin: boolean,
  rending: boolean = false,
  starfire: boolean = false,
): FinalDiceProb
{
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
