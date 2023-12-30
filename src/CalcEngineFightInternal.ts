import { clone } from "lodash";

import Attacker from "src/Attacker";
import * as Util from 'src/Util';
import * as Common from 'src/CalcEngineCommon';
import FightStrategy from 'src/FightStrategy';
import FighterState from "src/FighterState";
import FightChoice from "src/FightChoice";
import Ability from "src/Ability";

export const toWoundPairKey = (guy1Wounds: number, guy2Wounds: number): string => [guy1Wounds, guy2Wounds].toString();
export const fromWoundPairKey = (woundsPairText: string): number[] => woundsPairText.split(',').map(x => parseInt(x));

export function consolidateWoundPairProbs(woundPairProbs: Map<string,number>): [Map<number,number>, Map<number,number>] {
  const guy1WoundProbs = new Map<number,number>();
  const guy2WoundProbs = new Map<number,number>();

  for(let [woundPairText, prob] of woundPairProbs) {
    const [guy1Wounds, guy2Wounds] = fromWoundPairKey(woundPairText);
    Util.addToMapValue(guy1WoundProbs, guy1Wounds, prob);
    Util.addToMapValue(guy2WoundProbs, guy2Wounds, prob);
  }

  return [guy1WoundProbs, guy2WoundProbs];
}

export function calcRemainingWoundPairProbs(
  guy1: Attacker,
  guy2: Attacker,
  guy1Strategy: FightStrategy = FightStrategy.MaxDmgToEnemy,
  guy2Strategy: FightStrategy = FightStrategy.MaxDmgToEnemy,
  numRounds: number = 1,
): Map<string, number> // remaining wound-pairs (as stringified array) to probs
{
  const guy1FinalDiceProbs = Common.calcFinalDiceProbsForAttacker(guy1);
  const guy2FinalDiceProbs = Common.calcFinalDiceProbsForAttacker(guy2);

  let endingWoundPairProbs = new Map<string, number>();

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
      Util.addToMapValue(
        endingWoundPairProbs,
        toWoundPairKey(guy1State.currentWounds, guy2State.currentWounds),
        combinedProb,
      );
    }
  }

  if(numRounds > 1) {
    const woundPairProbsAfterMoreRounds = new Map<string,number>();

    for(let [woundPairText, prob] of endingWoundPairProbs) {
      const [guy1Wounds, guy2Wounds] = fromWoundPairKey(woundPairText);

      if(guy1Wounds === 0 || guy2Wounds === 0) {
        Util.addToMapValue(woundPairProbsAfterMoreRounds, woundPairText, prob);
      }
      else {
        const woundPairProbsForBranch = calcRemainingWoundPairProbs(
          guy1.withProp('wounds', guy1Wounds),
          guy2.withProp('wounds', guy2Wounds),
          guy1Strategy,
          guy2Strategy,
          numRounds - 1,
        );

        for(let [branchWoundPairText, branchProb] of woundPairProbsForBranch) {
          Util.addToMapValue(woundPairProbsAfterMoreRounds, branchWoundPairText, prob * branchProb);
        }
      }
    }

    endingWoundPairProbs = woundPairProbsAfterMoreRounds;
  }

  return endingWoundPairProbs;
}

export function resolveFight(
  guy1State: FighterState,
  guy2State: FighterState,
): void
{
  let currentGuy = guy1State;
  let nextGuy = guy2State;

  handleDuelist(guy1State, guy2State);
  handleDuelist(guy2State, guy1State);

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

export function calcDieChoice(chooser: FighterState, enemy: FighterState): FightChoice {
  // note: this function assumes both chooser and enemy have remaining successes

  // ALWAYS strike if you can kill enemy with a single strike;
  // also, if enemy has brutal and you have no crits, then you must strike;
  if(chooser.nextDmg() >= enemy.currentWounds
    || (enemy.profile.has(Ability.Brutal) && chooser.crits === 0)) {
    return chooser.nextStrike();
  }

  // if can stun enemy (crit strike that also cancels an enemy NORM success),
  // and enemy doesn't have any crit successes, then there is no downside
  // to doing a stunning crit strike now
  if(chooser.profile.has(Ability.Stun) && !chooser.hasDoneStun && chooser.crits > 0 && enemy.crits === 0) {
    return FightChoice.CritStrike;
  }

  // if can parry last enemy success and still kill, then that is awesome
  // and we should do that
  const awesomeParry = calcParryForLastEnemySuccessThenKillEnemy(chooser, enemy);
  if(awesomeParry !== null) {
    return awesomeParry;
  }

  if(chooser.strategy === FightStrategy.Strike) {
    return chooser.nextStrike();
  }
  else if(chooser.strategy === FightStrategy.Parry) {
    return wiseParry(chooser, enemy);
  }
  else if(chooser.strategy === FightStrategy.MaxDmgToEnemy
    || chooser.strategy === FightStrategy.MinDmgToSelf)
  {
    // calc dmgs if all strike or all parry; take better option
    const enemyWeStruck = enemy.withStrategy(FightStrategy.Strike);
    const enemyWeParried = clone(enemyWeStruck);

    const chooserWhoStruck = clone(chooser);
    const chooserWhoParried = clone(chooser);
    const strikeChoice = chooser.nextStrike();
    const parryChoice = wiseParry(chooser, enemy);

    resolveDieChoice(strikeChoice, chooserWhoStruck, enemyWeStruck);
    resolveDieChoice(parryChoice, chooserWhoParried, enemyWeParried);

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
      return strikeChoice;
    }
    else {
      return parryChoice;
    }
  }

  throw new Error('unsupported FightStrategy: ' + chooser.strategy);
}

export function resolveDieChoice(
  choice: FightChoice,
  chooser: FighterState,
  enemy: FighterState,
): void {
  function applyFirstStrikeDmg(dmg: number) {
    if(!chooser.hasStruck) {
      if(enemy.profile.abilities.has(Ability.JustAScratch)) {
        dmg = 0;
      } else if(chooser.profile.abilities.has(Ability.Hammerhand)) {
        dmg++;
      }
      chooser.hasStruck = true;
    }
    enemy.applyDmg(dmg);
  }

  if(choice === FightChoice.CritStrike) {
    chooser.crits--;
    applyFirstStrikeDmg(chooser.profile.critDmg);

    if (
      chooser.successes()
      && chooser.profile.has(Ability.MurderousEntrance)
      && !chooser.hasDoneMurderousEntrance
    ) {
      chooser.hasDoneMurderousEntrance = true;

      if(chooser.crits > 0) {
        chooser.crits--;
        enemy.applyDmg(chooser.profile.critDmg);
      }
      else {
        chooser.norms--;
        enemy.applyDmg(chooser.profile.normDmg);
      }
    }

    if(chooser.profile.has(Ability.Stun) && !chooser.hasDoneStun) {
      chooser.hasDoneStun = true;
      enemy.norms = Math.max(0, enemy.norms - 1); // stun ability can only cancel an enemy norm success
    }
  }
  else if(choice === FightChoice.NormStrike) {
    chooser.norms--;
    applyFirstStrikeDmg(chooser.profile.normDmg);
  }
  else if(choice === FightChoice.CritParry) {
    chooser.crits--;

    // Dueller: critical parry can cancel additional normal success
    if(chooser.profile.abilities.has(Ability.Dueller)) {
      let numCritsCancelled = 0;

      if(enemy.crits > 0) {
        enemy.crits--;
        numCritsCancelled++;
      }

      enemy.norms = Math.max(0, enemy.norms - 2 + numCritsCancelled);
    }
    else {
      for(let numCancelled = 0; numCancelled < chooser.profile.cancelsPerParry(); numCancelled++) {
        if(enemy.crits > 0) {
          enemy.crits--;
        }
        else if(enemy.norms > 0) {
          enemy.norms--;
        }
      }
    }
  }
  else if(choice === FightChoice.NormParry) {
    if(enemy.profile.has(Ability.Brutal)) {
      throw new Error("not allowed to do FightChoice.NormParry when enemy has brutal")
    }
    chooser.norms--;
    enemy.norms = Math.max(0, enemy.norms - chooser.profile.cancelsPerParry());
  }
  else {
    throw new Error("invalid DieChoice");
  }
}

export function calcParryForLastEnemySuccessThenKillEnemy(
  chooser: FighterState,
  enemy: FighterState,
): FightChoice | null
{
  // note: this function assumes chooser and enemy have successes

  // reminder: enemy having brutal means chooser can only parry with crits
  if(enemy.profile.has(Ability.Brutal)) {
    if(chooser.crits === 0) {
      return null;
    }
  }

  const enemySuccesses = enemy.crits + enemy.norms;

  // if chooser can parry enemy's remaining success (or successes due to storm shield)
  // AND kill enemy afterwards, then chooser should parry
  let fightChoice: FightChoice | null = null;

  // special case for Dueller
  if(chooser.profile.abilities.has(Ability.Dueller)
    && chooser.crits > 0
    && enemy.crits <= 1
    && enemySuccesses <= 2
  ) {
    fightChoice = FightChoice.CritParry;
  }
  // handle StormShield and normal
  else if(enemy.crits + enemy.norms <= chooser.profile.cancelsPerParry()) {

    if(enemy.crits > 0) {
      if(chooser.crits > 0) {
        fightChoice = FightChoice.CritParry;
      }
      // else chooser has no crits and can not parry the enemy crit
    }
    // else enemy.norms > 0
    else {
      if(chooser.norms > 0 && !enemy.profile.has(Ability.Brutal)) {
        fightChoice = FightChoice.NormParry;
      }
      else {
        fightChoice = FightChoice.CritParry;
      }
    }
  }

  if(fightChoice !== null) {
    const critsAfterParry = chooser.crits - (fightChoice === FightChoice.CritParry ? 1 : 0);
    const normsAfterParry = chooser.norms - (fightChoice === FightChoice.NormParry ? 1 : 0);
    const remainingDmg = chooser.possibleDmg(critsAfterParry, normsAfterParry);

    if(remainingDmg >= enemy.profile.wounds) {
      return fightChoice;
    }
  }

  return null;
}

export function wiseParry(chooser: FighterState, enemy: FighterState): FightChoice {
  // function is only called when both chooser and enemy have successes

  // use our crits to parry enemy crits; otherwise save our crits
  // for possible strikes once all enemy successes are gone
  if (enemy.crits > 0 && chooser.crits > 0) {
    return FightChoice.CritParry;
  }
  // do a norm parry, but only if there is an enemy norm success to cancel
  else if (chooser.norms > 0 && enemy.norms > 0 && !enemy.profile.has(Ability.Brutal)) {
    return FightChoice.NormParry;
  }
  // this is a CritParry of an enemy norm success
  else if (chooser.crits > 0) {
    return FightChoice.CritParry;
  }
  // remaining scenario is chooser has only norm successes and {enemy has only crit successes or brutal}
  return FightChoice.NormStrike;
}

export function handleDuelist(
  guy1State: FighterState,
  guy2State: FighterState,
): void
{
  if (
    !guy1State.profile.abilities.has(Ability.Duelist)
    || guy1State.successes() === 0
    || guy2State.successes() === 0
  ) {
    return;
  }

  if(guy2State.profile.has(Ability.Brutal)) {
    if(guy1State.crits) {
      resolveDieChoice(FightChoice.CritParry, guy1State, guy2State);
    }
    return;
  }

  let parryChoice: FightChoice;

  if (guy1State.crits && guy2State.crits) {
    parryChoice = FightChoice.CritParry;
  }
  else if (guy1State.norms === 0) {
    parryChoice = FightChoice.CritParry;
  }
  else {
    parryChoice = FightChoice.NormParry;
  }

  resolveDieChoice(parryChoice, guy1State, guy2State);
}