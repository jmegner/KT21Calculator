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
  ): void {
    const currProb = atk.prob * def.prob;
    const damage = calcDamage(
      attacker,
      atk.crits,
      atk.norms,
      def.crits + extraCritSaves,
      def.norms + extraNormSaves,
      shootOptions.isFireTeamRules);

    if (damage > 0) {
      Util.addToMapValue(damageToProb, damage, currProb);
    }
  }

  for (const atk of attackerFinalDiceProbs) {
    if (atk.crits + atk.norms > 0) {
      if (defenderStuff.pxIsRelevant && atk.crits > 0) {
        for (const def of defenderStuff.finalDiceProbsWithPx) {
          addAtkDefScenario(atk, def, defenderStuff.coverCritSavesWithPx, defenderStuff.coverNormSavesWithPx);
        }
      }
      else {
        for (const def of defenderStuff.finalDiceProbs) {
          addAtkDefScenario(atk, def, defenderStuff.coverCritSaves, defenderStuff.coverNormSaves);
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