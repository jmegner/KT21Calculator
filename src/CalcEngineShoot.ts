import Attacker from "src/Attacker";
import Defender from "src/Defender";
import * as Util from 'src/Util';
import FinalDiceProb from 'src/FinalDiceProb';
import * as Common from 'src/CalcEngineCommon';
import ShootOptions from "src/ShootOptions";
import {
  calcDamage,
  calcDefenderFinalDiceStuff,
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
  ): void {
    const currProb = atk.prob * def.prob;

    const damage = calcDamage(
      attacker,
      atk.crits,
      atk.norms,
      def.crits,
      def.norms,
      shootOptions.isFireTeamRules);

    if (damage > 0) {
      Util.addToMapValue(damageToProb, damage, currProb);
    }
  }

  for (const atk of attackerFinalDiceProbs) {
    if (atk.crits + atk.norms > 0) {
      if (defenderStuff.pxIsRelevant && atk.crits > 0) {
        for (const def of defenderStuff.finalDiceProbsWithPx) {
          addAtkDefScenario(atk, def);
        }
      }
      else {
        for (const def of defenderStuff.finalDiceProbs) {
          addAtkDefScenario(atk, def);
        }
      }
    }
  }

  if(defender.usesFnp()) {
    damageToProb = calcPostFnpDamages(defender.fnp, damageToProb);
  }

  Util.fillInProbForZero(damageToProb);

  if(shootOptions.numRounds > 1) {
    damageToProb = Common.calcMultiRoundDamage(damageToProb, shootOptions.numRounds);
  }

  return damageToProb;
}