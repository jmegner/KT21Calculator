import Attacker from "src/Attacker";
import FightStrategy from 'src/FightStrategy';
import {
  consolidateWoundPairProbs,
  calcRemainingWoundPairProbs,
} from "./CalcEngineFightInternal";

export function calcRemainingWounds(
  guy1: Attacker,
  guy2: Attacker,
  guy1Strategy: FightStrategy = FightStrategy.MaxDmgToEnemy,
  guy2Strategy: FightStrategy = FightStrategy.MaxDmgToEnemy,
  numRounds: number = 1,
): [Map<number, number>, Map<number,number>] // remaining wounds to prob
{
  return consolidateWoundPairProbs(calcRemainingWoundPairProbs(guy1, guy2, guy1Strategy, guy2Strategy, numRounds));
}
