import { randomInt } from "mathjs";
import { executeAndMeasureMs, } from 'src/Util';
import { DeadzoneModel, DeadzoneOptions, deadzoneCalcDmgProbs } from "src/DiceSim/pkg/dice_sim";


export function calcDmgProbs(
  attacker: DeadzoneModel,
  defender: DeadzoneModel,
  options: DeadzoneOptions = new DeadzoneOptions(),
): Map<number, number> // damage to prob
{
  let wasmAnswer: Map<number, number> = new Map<number, number>();
  executeAndMeasureMs(
    () => {wasmAnswer = deadzoneCalcDmgProbs(attacker, defender, options);},
    `deadzoneCalcDmgProbs sims=${options.numSimulations}`,
  );

  return wasmAnswer;
}
