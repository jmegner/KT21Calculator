import Attacker from "src/Attacker";
import Defender from "src/Defender";
import * as Util from 'src/Util';
import FinalDiceProb from 'src/FinalDiceProb';
import * as Common from 'src/CalcEngineCommon';
import ShootOptions from "src/ShootOptions";
import {
  calcDamage,
  calcDefenderFinalDiceStuff,
  calcMultiRoundDamage,
  calcPostFnpDamages,
} from 'src/CalcEngineShootInternal'

export function calcDmgProbs(
  attacker: Attacker,
  defender: Defender,
  shootOptions: ShootOptions = new ShootOptions(),
): Map<number, number> // damage to prob
{
  const attackerFinalDiceProbs = Common.calcFinalDiceProbsForAttacker(attacker);
  const defenderStuff = calcDefenderFinalDiceStuff(defender, attacker);

  // don't add damage=0 stuff until just before multi-round handling
  let damageToProb = new Map<number, number>();

  function addAtkDefScenario(
    atk: FinalDiceProb,
    def: FinalDiceProb,
    extraCritSaves: number,
    extraNormSaves: number,
    numSavePromotions: number,
  ): void {
    const currProb = atk.prob * def.prob;
    let critSaves = def.crits + extraCritSaves;
    let normSaves = def.norms + extraNormSaves;
    const actualPromotions = Math.min(numSavePromotions, normSaves);
    critSaves += actualPromotions;
    normSaves -= actualPromotions;

    const damage = calcDamage(
      attacker,
      atk.crits,
      atk.norms,
      critSaves,
      normSaves,
      shootOptions.isFireTeamRules);

    if (damage > 0) {
      Util.addToMapValue(damageToProb, damage, currProb);
    }
  }

  for (const atk of attackerFinalDiceProbs) {
    if (atk.crits + atk.norms > 0) {
      if (defenderStuff.pxIsRelevant && atk.crits > 0) {
        for (const def of defenderStuff.finalDiceProbsWithPx) {
          addAtkDefScenario(
            atk,
            def,
            defenderStuff.coverCritSavesWithPx,
            defenderStuff.coverNormSavesWithPx,
            defender.normToCritPromotions,
          );
        }
      }
      else {
        for (const def of defenderStuff.finalDiceProbs) {
          addAtkDefScenario(
            atk,
            def,
            defenderStuff.coverCritSaves,
            defenderStuff.coverNormSaves,
            defender.normToCritPromotions,
          );
        }
      }
    }
  }

  if(defender.usesFnp()) {
    damageToProb = calcPostFnpDamages(defender.fnp, damageToProb);
  }

  Util.fillInProbForZero(damageToProb);

  if(shootOptions.numRounds > 1) {
    damageToProb = calcMultiRoundDamage(damageToProb, shootOptions.numRounds);
  }

  return damageToProb;
}