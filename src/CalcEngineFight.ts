import _ from "lodash";

import Attacker from "src/Attacker";
import * as Util from 'src/Util';
import * as Common from 'src/CalcEngineCommon';
import FightStrategy from 'src/FightStrategy';
import FighterState from "./FighterState";
import FightChoice from "./FightChoice";

export function calcRemainingWounds(
  guy1: Attacker,
  guy2: Attacker,
  guy1Strategy: FightStrategy = FightStrategy.MaxDmgToEnemy,
  guy2Strategy: FightStrategy = FightStrategy.MaxDmgToEnemy,
  numRounds: number = 1,
): [Map<number, number>, Map<number,number>] // damage to prob
{
  const guy1FinalDiceProbs = Common.calcFinalDiceProbsForAttacker(guy1);
  const guy2FinalDiceProbs = Common.calcFinalDiceProbsForAttacker(guy2);
  const guy1EndingWoundsProbs = new Map<number,number>();
  const guy2EndingWoundsProbs = new Map<number,number>();

  for(let guy1Dice of guy1FinalDiceProbs) {
    for(let guy2Dice of guy2FinalDiceProbs) {
      const guy1State = new FighterState(
        guy1,
        guy1Dice.crits,
        guy1Dice.norms,
        guy1Strategy,
      );
      const guy2State = new FighterState(
        guy2,
        guy2Dice.crits,
        guy2Dice.norms,
        guy2Strategy,
      );

      resolveFight(guy1State, guy2State);

      const combinedProb = guy1Dice.prob * guy2Dice.prob;
      Util.addToMapValue(guy1EndingWoundsProbs, guy1State.currentWounds, combinedProb);
      Util.addToMapValue(guy2EndingWoundsProbs, guy2State.currentWounds, combinedProb);
    }
  }

  return [guy1EndingWoundsProbs, guy2EndingWoundsProbs];
}

function resolveFight(
  guy1State: FighterState,
  guy2State: FighterState,
): void
{
  let currentGuy = guy1State;
  let nextGuy = guy2State;

  while(currentGuy.crits + currentGuy.norms + nextGuy.crits + nextGuy.norms > 0
    && currentGuy.currentWounds > 0 && nextGuy.currentWounds > 0)
  {
    // if a guy is out of successes, then other guy does all strikes
    if(currentGuy.crits + currentGuy.norms <= 0) {
      currentGuy.applyDmg(nextGuy.totalDmg());
      break;
    }
    else if(nextGuy.crits + nextGuy.norms <= 0) {
      nextGuy.applyDmg(currentGuy.totalDmg());
      break;
    }
    else {
      const choice = calcDieChoice(currentGuy, nextGuy);
      resolveDieChoice(choice, currentGuy, nextGuy);
      [currentGuy, nextGuy] = [nextGuy, currentGuy];
    }
  }

  if(guy1State.crits < 0 || guy1State.norms < 0
    || guy2State.crits < 0 || guy1State.norms < 0)
  {
    throw new Error("bug: ended up with negative successes")
  }
}

function calcDieChoice(chooser: FighterState, enemy: FighterState): FightChoice {
  // note: this function assumes both chooser and enemy have remaining successes

  // ALWAYS strike if you can kill enemy with a single strike
  // OR if enemy has brutal
  if(chooser.nextDmg() >= enemy.currentWounds || enemy.profile.brutal) {
    return chooser.nextStrike();
  }

  // if can parry last enemy success and still kill, then that is awesome
  // and we should do that
  const awesomeParry = calcParryForLastEnemySuccessThenKillEnemy(chooser, enemy);
  if(awesomeParry !== null) {
    return awesomeParry;
  }

  if(chooser.strategy === FightStrategy.Strike) {
    return chooser.crits > 0 ? FightChoice.CritStrike : FightChoice.NormStrike;
  }
  else if(chooser.strategy === FightStrategy.Parry) {
    return wiseParry(chooser, enemy);
  }
  else if(chooser.strategy === FightStrategy.MaxDmgToEnemy
    || chooser.strategy === FightStrategy.MinDmgToSelf)
  {
    // calc dmgs if all strike or all parry; take better option
    const enemyWeStruck = enemy.withStrategy(FightStrategy.Strike);
    const enemyWeParried = _.clone(enemyWeStruck);

    const chooserWhoStruck = _.clone(chooser);
    const chooserWhoParried = _.clone(chooser);

    resolveDieChoice(chooser.nextStrike(), chooserWhoStruck, enemyWeStruck);
    resolveDieChoice(wiseParry(chooser, enemy), chooserWhoParried, enemyWeParried);

    resolveFight(enemyWeStruck, chooserWhoStruck);
    resolveFight(enemyWeParried, chooserWhoParried);

    let wantStrike = true;

    if(chooser.strategy === FightStrategy.MaxDmgToEnemy) {
      wantStrike = enemyWeStruck.currentWounds <= enemyWeParried.currentWounds;
    }
    // else MinDmgToSelf
    else {
      wantStrike = chooserWhoStruck.currentWounds >= chooserWhoParried.currentWounds;
    }

    if(wantStrike) {
      return chooser.nextStrike();
    }
    else {
      return wiseParry(chooser, enemy);
    }
  }

  throw new Error('unsupported FightStrategy: ' + chooser.strategy);
}

function resolveDieChoice(
  choice: FightChoice,
  chooser: FighterState,
  enemy: FighterState,
): void
{
  if(choice === FightChoice.CritStrike) {
    chooser.crits--;
    enemy.applyDmg(chooser.profile.critDmg);
  }
  else if(choice === FightChoice.NormStrike) {
    chooser.norms--;
    enemy.applyDmg(chooser.profile.normDmg);
  }
  else if(choice === FightChoice.CritParry) {
    chooser.crits--;

    if(enemy.crits > 0) {
      enemy.crits--;
    }
    else {
      enemy.norms--;
    }
  }
  else if(choice === FightChoice.NormParry) {
    chooser.norms--;
    enemy.norms--;
  }
  else {
    throw new Error("invalid DieChoice");
  }
}

function calcParryForLastEnemySuccessThenKillEnemy(
  chooser: FighterState,
  enemy: FighterState,
): FightChoice | null
{
  // if enemy has only one success left, and chooser can parry it with
  // enough damage left over to kill enemy, chooser should parry
  if(enemy.norms + enemy.crits === 1) {
    let critsAfterParry = 0;
    let normsAfterParry = 0;
    let fightChoice: FightChoice | null = null;

    if(enemy.norms === 1) {
      if(chooser.norms > 0) {
        critsAfterParry = chooser.crits;
        normsAfterParry = chooser.norms - 1;
        fightChoice = FightChoice.NormParry;
      }
      else {
        critsAfterParry = chooser.crits - 1;
        normsAfterParry = chooser.norms;
        fightChoice = FightChoice.CritParry;
      }
    }
    else if(enemy.crits === 1) {
      if(chooser.crits >= 1) {
        critsAfterParry = chooser.crits - 1;
        normsAfterParry = chooser.norms;
        fightChoice = FightChoice.CritParry;
      }
    }

    if(fightChoice !== null) {
      const remainingDmg = chooser.profile.possibleDmg(critsAfterParry, normsAfterParry);

      if(remainingDmg >= enemy.profile.wounds) {
        return fightChoice;
      }
    }
  }

  return null;
}

function wiseParry(chooser: FighterState, enemy: FighterState): FightChoice {
  // function is only called when both chooser and enemy have successes

  // use our crits to parry enemy crits; otherwise save our crits
  // for possible strikes once all enemy successes are gone
  if (enemy.crits > 0 && chooser.crits > 0) {
    return FightChoice.CritParry;
  }
  // do a norm parry, but only if there is an enemy norm success to cancel
  else if (chooser.norms > 0 && enemy.norms > 0) {
    return FightChoice.NormParry;
  }
  else if (chooser.crits > 0) {
    return FightChoice.CritParry;
  }
  // remaining scenario is chooser has only norm successes and enemy has only crit successes
  return FightChoice.NormStrike;
}

export const exportedForTesting = {
  FightChoice,
  FighterState,
  calcDieChoice,
  calcParryForLastEnemySuccessThenKillEnemy,
  resolveDieChoice,
  resolveFight,
  wiseParry,
};