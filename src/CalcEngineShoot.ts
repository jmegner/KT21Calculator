import _ from "lodash";

import Attacker from "src/Attacker";
import Defender from "src/Defender";
import * as Util from 'src/Util';
import FinalDiceProb from 'src/FinalDiceProb';
import * as Common from 'src/CalcEngineCommon';

class DefenderFinalDiceStuff {
  public finalDiceProbs: FinalDiceProb[];
  public finalDiceProbsWithPx: FinalDiceProb[];
  public pxIsRelevant: boolean;
  public coverSaves: number;
  public coverSavesWithPx: number;

  public constructor(
    finalDiceProbs: FinalDiceProb[],
    finalDiceProbsWithPx: FinalDiceProb[],
    pxIsRelevant: boolean,
    coverSaves: number,
    coverSavesWithPx: number,
  )
  {
    this.finalDiceProbs = finalDiceProbs;
    this.finalDiceProbsWithPx = finalDiceProbsWithPx;
    this.pxIsRelevant = pxIsRelevant;
    this.coverSaves = coverSaves;
    this.coverSavesWithPx = coverSavesWithPx;
  }
}

export function calcDmgProbs(
  attacker: Attacker,
  defender: Defender,
  numRounds: number = 1,
): Map<number, number> // damage to prob
{
  const attackerFinalDiceProbs = Common.calcFinalDiceProbsForAttacker(attacker);
  const defenderStuff = calcDefenderFinalDiceStuff(defender, attacker);

  // don't add damage=0 stuff until just before multi-round handling
  let damageToProb = new Map<number, number>();

  function addAtkDefScenario(atk: FinalDiceProb, def: FinalDiceProb, extraSaves: number): void {
    const currProb = atk.prob * def.prob;
    const damage = calcDamage(attacker, atk.crits, atk.norms, def.crits, def.norms + extraSaves);

    if (damage > 0) {
      Util.addToMapValue(damageToProb, damage, currProb);
    }
  }

  for (const atk of attackerFinalDiceProbs) {
    if (atk.crits + atk.norms > 0) {
      if (defenderStuff.pxIsRelevant && atk.crits > 0) {
        for (const def of defenderStuff.finalDiceProbsWithPx) {
          addAtkDefScenario(atk, def, defenderStuff.coverSavesWithPx);
        }
      }
      else {
        for (const def of defenderStuff.finalDiceProbs) {
          addAtkDefScenario(atk, def, defenderStuff.coverSaves);
        }
      }
    }
  }

  if(defender.usesFnp()) {
    damageToProb = calcPostFnpDamages(defender.fnp, damageToProb);
  }

  let positiveDamageProbSum = 0;
  damageToProb.forEach(prob => positiveDamageProbSum += prob);

  if (positiveDamageProbSum < 1) {
    damageToProb.set(0, 1 - positiveDamageProbSum);
  }

  if(numRounds > 1) {
    damageToProb = calcMultiRoundDamage(damageToProb, numRounds);
  }

  return damageToProb;
}

function calcDefenderFinalDiceStuff(
  defender: Defender,
  attacker: Attacker,
): DefenderFinalDiceStuff
{
  const defenderSingleDieProbs = defender.toDieProbs();

  const numDefDiceWithoutPx = defender.usesInvulnSave() ? defender.defense : defender.defense - attacker.apx;
  const coverSaves = Math.min(defender.coverSaves, numDefDiceWithoutPx);
  const numDefRollsWithoutPx = numDefDiceWithoutPx - coverSaves;

  const defenderFinalDiceProbs = Common.calcFinalDiceProbs(
    defenderSingleDieProbs,
    numDefRollsWithoutPx,
    defender.chitin,
    );

  let defenderFinalDiceProbsWithPx: FinalDiceProb[] = [];

  // if APx > Px, then ignore Px
  const effectivePx = attacker.apx >= attacker.px ? 0 : attacker.px;
  const pxIsRelevant = effectivePx > 0 && !defender.usesInvulnSave();
  let coverSavesWithPx = 0;

  // for Px triggered and relevant
  if (pxIsRelevant) {
    const numDefDiceWithPx = defender.defense - effectivePx;
    coverSavesWithPx = Math.min(defender.coverSaves, numDefDiceWithPx);
    const numDefRollsWithPx = numDefDiceWithPx - coverSavesWithPx;

    defenderFinalDiceProbsWithPx = Common.calcFinalDiceProbs(
      defenderSingleDieProbs,
      numDefRollsWithPx,
      defender.chitin,
    );
  }

  return new DefenderFinalDiceStuff(
    defenderFinalDiceProbs,
    defenderFinalDiceProbsWithPx,
    pxIsRelevant,
    coverSaves,
    coverSavesWithPx,
  );
}

function calcPostFnpDamages(
  fnp: number,
  preFnpDmgs: Map<number,number>,
  skipZeroDamage: boolean = true,
): Map<number,number>
{
  const postFnpDmgs = new Map<number,number>();
  const probDamagePersists = (fnp - 1) / 6;

  preFnpDmgs.forEach((preFnpProb, preFnpDmg) => {
    for(let postFnpDmg = skipZeroDamage ? 1 : 0; postFnpDmg <= preFnpDmg; postFnpDmg++) {
      const withinFnpProb = Util.binomialPmf(preFnpDmg, postFnpDmg, probDamagePersists);
      Util.addToMapValue(postFnpDmgs, postFnpDmg, preFnpProb * withinFnpProb);
    }
  });

  return postFnpDmgs;
}

function calcMultiRoundDamage(
  dmgsSingleRound: Map<number,number>,
  numRounds: number,
): Map<number, number>
{
  let dmgsCumulative = new Map<number,number>(dmgsSingleRound);

  for(let roundIdx of _.range(1, numRounds)) { // eslint-disable-line
    const dmgsPrevRounds = dmgsCumulative;
    dmgsCumulative = new Map<number,number>();

    for(let [dmgPrevRounds, probPrevRounds] of dmgsPrevRounds) {
      for(let [dmgSingleRound, probSingleRound] of dmgsSingleRound) {
        const dmgCumulative = dmgPrevRounds + dmgSingleRound;
        Util.addToMapValue(dmgsCumulative, dmgCumulative, probPrevRounds * probSingleRound);
      }
    }
  }

  return dmgsCumulative;
}

function calcDamage(
  attacker: Attacker,
  critHits: number,
  normHits: number,
  critSaves: number,
  normSaves: number,
): number {
  let damage = critHits * attacker.mwx;

  const numNormalSavesToCancelCritHit = 2;

  function critSavesCancelCritHits() {
    const numCancels = Math.min(critSaves, critHits);
    critSaves -= numCancels;
    critHits -= numCancels;
  }
  function critSavesCancelNormHits() {
    const numCancels = Math.min(critSaves, normHits);
    critSaves -= numCancels;
    normHits -= numCancels;
  }
  function normSavesCancelNormHits() {
    const numCancels = Math.min(normSaves, normHits);
    normSaves -= numCancels;
    normHits -= numCancels;
  }
  function normSavesCancelCritHits() {
    const numCancels = Math.min((normSaves / numNormalSavesToCancelCritHit) >> 0, critHits);
    normSaves -= numCancels * numNormalSavesToCancelCritHit;
    critHits -= numCancels;
  }

  if (attacker.critDmg >= attacker.normDmg) {
    critSavesCancelCritHits();
    critSavesCancelNormHits();

    if (attacker.critDmg > 2 * attacker.normDmg) {
      normSavesCancelCritHits();
      normSavesCancelNormHits();
    }
    else {
      // with norm saves, you prefer to cancel norm hits, but you want to avoid
      // cancelling all norm hits and being left over with >=1 crit hit and 1 normal save;
      // in that case, you should have cancelled 1 crit hit before cancelling norm hits;
      if (normSaves > normHits && normSaves >= numNormalSavesToCancelCritHit && critHits > 0) {
        normSaves -= numNormalSavesToCancelCritHit;
        critHits--;
      }

      normSavesCancelNormHits();
      normSavesCancelCritHits();
    }
  }
  else {
    normSavesCancelNormHits();
    critSavesCancelNormHits();
    critSavesCancelCritHits();
    normSavesCancelCritHits();
  }

  damage += critHits * attacker.critDmg + normHits * attacker.normDmg;
  return damage;
}

export const exportedForTesting = {
  calcDamage,
  calcMultiRoundDamage,
  calcPostFnpDamages,
};

