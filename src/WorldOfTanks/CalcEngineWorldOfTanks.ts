import FinalDiceProb from 'src/FinalDiceProb';
import Tank from "./Tank";
import { addToDmgProbs, calcFinalDiceProbs } from 'src/WorldOfTanks/CalcEngineWorldOfTanksInternal';
import { fillInProbForZero } from 'src/Util';
import { calcMultiRoundDamage } from 'src/CalcEngineCommon';

export function calcDmgAndCritProbs(
  attacker: Tank,
  defender: Tank,
  numRounds: number,
): [Map<number,number>, Map<number,number>] {
  const attackerProbs: FinalDiceProb[] = calcFinalDiceProbs(attacker);
  const defenderProbs: FinalDiceProb[] = calcFinalDiceProbs(defender);

  let dmgToProb = new Map<number,number>();
  let critsToProb = new Map<number,number>();

  for (const atk of attackerProbs) {
    for (const def of defenderProbs) {
      addToDmgProbs(dmgToProb, critsToProb, attacker, atk, def);
    }
  }

  fillInProbForZero(dmgToProb);
  fillInProbForZero(critsToProb);

  if(numRounds > 1) {
    dmgToProb = calcMultiRoundDamage(dmgToProb, numRounds);
    critsToProb = calcMultiRoundDamage(critsToProb, numRounds);
  }

  return [dmgToProb, critsToProb];
}
