import * as Util from 'src/Util';
import FinalDiceProb from 'src/FinalDiceProb';
import * as Common from 'src/CalcEngineCommon';
import DieProbs from "src/DieProbs";
import Tank from "src/WorldOfTanks/Tank";
import Reroll, { toAbility } from "src/WorldOfTanks/Reroll";
import { factorial } from 'mathjs';
import { sum, zip } from 'lodash';
import Ability from 'src/Ability';

export function calcFinalDiceProbs(tank: Tank): FinalDiceProb[] {
  const dieProbs = new DieProbs(
    tank.reroll === Reroll.All ? 1 / 4 : 1 / 6,
    tank.reroll === Reroll.All ? 1 / 2 : 1 / 3,
  );

  const probs = new Array<FinalDiceProb>();

  for(let crits = 0; crits <= tank.dice; crits++) {
    for(let norms = 0; norms <= tank.dice - crits; norms++) {
      const fails = tank.dice - crits - norms;
      const prob = Common.calcFinalDiceProb( dieProbs, crits, norms, fails, toAbility(tank.reroll));
      probs.push(prob);

      // want to Modify Crits to Hits before Hits to Crits
      if(tank.critsToHits > 0) {
        const numModified = Math.min(tank.critsToHits, prob.crits);
        prob.crits -= numModified;
        prob.norms += numModified;
      }

      if(tank.hitsToCrits > 0) {
        const numModified = Math.min(tank.hitsToCrits, prob.norms);
        prob.norms -= numModified;
        prob.crits += numModified;
      }

      if(tank.targetIsHullDown) {
        if(prob.norms > 0) {
          prob.norms--;
        }
      }
    }
  }

  return probs;
}

export function addToDmgProbs(
  dmgToProb: Map<number,number>,
  critsToProb: Map<number,number>,
  attacker: Tank,
  atk: FinalDiceProb,
  def: FinalDiceProb,
): void {
  // if defense dice can cancel all attack dice, then we don't need to do anything
  if(atk.crits + atk.norms <= def.crits + def.norms) {
    return;
  }

  const critDiff = atk.crits - def.crits;
  const normDiff = atk.norms - def.norms;
  const netCrits = Math.max(0, critDiff) + Math.min(0, normDiff);
  const netNorms = attacker.highExplosive ? 0 : Math.max(0, normDiff) + Math.min(0, critDiff);

  const baseProb = atk.prob * def.prob;
  const critDmgProbs = ( attacker.deadeye
    //  0          1           2           3
    ? [ 81 / 1024, 243 / 1024, 576 / 1024, 124 / 1024 ]
    : [  9 / 32,     9 / 32,    12 / 32,     2 / 32 ]
  );

  if(netCrits > 0) {
    Util.addToMapValue(critsToProb, netCrits, baseProb);

    for(let numDmg0 = 0; numDmg0 <= netCrits; numDmg0++) {
      for(let numDmg1 = 0; numDmg0 + numDmg1 <= netCrits; numDmg1++) {
        for(let numDmg2 = 0; numDmg0 + numDmg1 + numDmg2 <= netCrits; numDmg2++) {
          const numDmg3 = netCrits - numDmg0 - numDmg1 - numDmg2;
          const critDmgCounts = [numDmg0, numDmg1, numDmg2, numDmg3];
          const multiCritDmgProb = calcMultiCountProb(critDmgCounts, critDmgProbs);
          const totalCritDmg = numDmg1 + numDmg2 * 2 + numDmg3 * 3;
          Util.addToMapValue(dmgToProb, netNorms + totalCritDmg, baseProb * multiCritDmgProb);
        }
      }
    }
  }
  else {
    Util.addToMapValue(dmgToProb, netNorms, baseProb);
  }

}

export function calcMultiCountProb(counts: number[], probs: number[]): number {
  let finalProb = factorial(sum(counts));

  for (const [count, prob] of zip(counts, probs)) {
    finalProb *= Math.pow(prob!, count!) / factorial(count!);
  }

  return finalProb;
}
