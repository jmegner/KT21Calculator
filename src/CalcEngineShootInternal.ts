import { range } from "lodash";

import Attacker from "src/Attacker";
import Defender from "src/Defender";
import * as Util from 'src/Util';
import FinalDiceProb from 'src/FinalDiceProb';
import * as Common from 'src/CalcEngineCommon';
import Ability from "./Ability";

class DefenderFinalDiceStuff {
  public finalDiceProbs: FinalDiceProb[];
  public finalDiceProbsWithPx: FinalDiceProb[];
  public pxIsRelevant: boolean;
  public coverCritSaves: number;
  public coverCritSavesWithPx: number;
  public coverNormSaves: number;
  public coverNormSavesWithPx: number;

  public constructor(
    finalDiceProbs: FinalDiceProb[],
    finalDiceProbsWithPx: FinalDiceProb[],
    pxIsRelevant: boolean,
    coverCritSaves: number,
    coverCritSavesWithPx: number,
    coverNormSaves: number,
    coverNormSavesWithPx: number,
  )
  {
    this.finalDiceProbs = finalDiceProbs;
    this.finalDiceProbsWithPx = finalDiceProbsWithPx;
    this.pxIsRelevant = pxIsRelevant;
    this.coverCritSaves = coverCritSaves;
    this.coverCritSavesWithPx = coverCritSavesWithPx;
    this.coverNormSaves = coverNormSaves;
    this.coverNormSavesWithPx = coverNormSavesWithPx;
  }
}

export function calcDefenderFinalDiceStuff(
  defender: Defender,
  attacker: Attacker,
): DefenderFinalDiceStuff
{
  const defenderSingleDieProbs = defender.toDieProbs();

  const numDefDiceWithoutPx = Math.max(0, defender.usesInvulnSave() ? defender.defense : defender.defense - attacker.apx);
  const coverCritSaves = Math.min(defender.coverCritSaves, numDefDiceWithoutPx);
  const coverNormSaves = Math.min(defender.coverNormSaves, numDefDiceWithoutPx - coverCritSaves);
  const numDefRollsWithoutPx = numDefDiceWithoutPx - coverCritSaves - coverNormSaves;

  const defenderFinalDiceProbs = Common.calcFinalDiceProbs(
    defenderSingleDieProbs,
    numDefRollsWithoutPx,
    defender.reroll,
    );

  let defenderFinalDiceProbsWithPx: FinalDiceProb[] = [];

  // if APx > Px, then ignore Px
  const effectivePx = attacker.apx >= attacker.px ? 0 : attacker.px;
  const pxIsRelevant = effectivePx > 0 && !defender.usesInvulnSave();
  let coverCritSavesWithPx = 0;
  let coverNormSavesWithPx = 0;

  // for Px triggered and relevant
  if (pxIsRelevant) {
    const numDefDiceWithPx = Math.max(0, defender.defense - effectivePx);
    coverCritSavesWithPx = Math.min(defender.coverCritSaves, numDefDiceWithPx);
    coverNormSavesWithPx = Math.min(defender.coverNormSaves, numDefDiceWithPx - coverCritSavesWithPx);
    const numDefRollsWithPx = numDefDiceWithPx - coverCritSavesWithPx - coverNormSavesWithPx;

    defenderFinalDiceProbsWithPx = Common.calcFinalDiceProbs(
      defenderSingleDieProbs,
      numDefRollsWithPx,
      defender.reroll,
    );
  }

  return new DefenderFinalDiceStuff(
    defenderFinalDiceProbs,
    defenderFinalDiceProbsWithPx,
    pxIsRelevant,
    coverCritSaves,
    coverCritSavesWithPx,
    coverNormSaves,
    coverNormSavesWithPx,
  );
}

export function calcPostFnpDamages(
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

export function calcMultiRoundDamage(
  dmgsSingleRound: Map<number,number>,
  numRounds: number,
): Map<number, number>
{
  let dmgsCumulative = new Map<number,number>(dmgsSingleRound);

  // eslint-disable-next-line
  for(let _ of range(1, numRounds)) { 
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

export function calcDamage(
  attacker: Attacker,
  critHits: number,
  normHits: number,
  critSaves: number,
  normSaves: number,
  isFireTeamRules: boolean = false,
): number {
  let damage = critHits * attacker.mwx;
  const numNormalSavesToCancelCritHit = 2; // for Kill Team rules, not Fire Team rules

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

  if(isFireTeamRules) {
    // simplest way to implement "saves of any type 1-to-1-cancel normHits then critHits"
    critSaves += normSaves;
    critSavesCancelNormHits();
    critSavesCancelCritHits();
  }
  // else Kill Team rules
  else {
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
  }

  damage += critHits * attacker.critDmg + normHits * attacker.normDmg;
  return damage;
}
