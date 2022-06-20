import FinalDiceProb from 'src/FinalDiceProb';
import Tank from "./Tank";
import { calcMultiRoundDamage } from 'src/CalcEngineShootInternal';
import { addToDmgProbs, calcFinalDiceProbs } from 'src/WorldOfTanks/CalcEngineWorldOfTanksInternal';

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

  let positiveDamageProbSum = 0;
  dmgToProb.forEach((prob, dmg) => {
    if(dmg > 0) {
      positiveDamageProbSum += prob;
     }
  });

  if (positiveDamageProbSum < 1) {
    dmgToProb.set(0, 1 - positiveDamageProbSum);
  }

  if(numRounds > 1) {
    dmgToProb = calcMultiRoundDamage(dmgToProb, numRounds);
    critsToProb = calcMultiRoundDamage(critsToProb, numRounds);
  }

  return [dmgToProb, critsToProb];
}
