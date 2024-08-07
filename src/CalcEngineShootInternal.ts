import Model from "src/Model";
import * as Util from 'src/Util';
import FinalDiceProb from 'src/FinalDiceProb';
import * as Common from 'src/CalcEngineCommon';
import Ability from "src/Ability";
import { MinCritDmgAfterDurable } from "./KtMisc";

class DefenderFinalDiceStuff {
  public finalDiceProbs: FinalDiceProb[];
  public finalDiceProbsWithPx: FinalDiceProb[];
  public pxIsRelevant: boolean;

  public constructor(
    finalDiceProbs: FinalDiceProb[],
    finalDiceProbsWithPx: FinalDiceProb[],
    pxIsRelevant: boolean,
  )
  {
    this.finalDiceProbs = finalDiceProbs;
    this.finalDiceProbsWithPx = finalDiceProbsWithPx;
    this.pxIsRelevant = pxIsRelevant;
  }
}

export function calcDefenderFinalDiceStuff(
  defender: Model,
  attacker: Model,
): DefenderFinalDiceStuff
{
  const defenderSingleDieProbs = defender.toDefenderDieProbs();

  const numDefDiceWithoutPx = Math.max(0, defender.usesInvulnSave() ? defender.numDice : defender.numDice - attacker.apx);

  const defenderFinalDiceProbs = Common.calcFinalDiceProbs(
    defenderSingleDieProbs,
    numDefDiceWithoutPx,
    defender.reroll,
    defender.autoCrits,
    defender.autoNorms,
    defender.failsToNorms,
    defender.normsToCrits,
    defender.abilities,
    );

  let defenderFinalDiceProbsWithPx: FinalDiceProb[] = [];

  // if APx > Px, then ignore Px
  const effectivePx = attacker.apx >= attacker.px ? 0 : attacker.px;
  const pxIsRelevant = effectivePx > 0 && !defender.usesInvulnSave();

  // for Px triggered and relevant
  if (pxIsRelevant) {
    const numDefDiceWithPx = Math.max(0, defender.numDice - effectivePx);

    defenderFinalDiceProbsWithPx = Common.calcFinalDiceProbs(
      defenderSingleDieProbs,
      numDefDiceWithPx,
      defender.reroll,
      defender.autoCrits,
      defender.autoNorms,
      defender.normsToCrits,
    );
  }

  return new DefenderFinalDiceStuff(
    defenderFinalDiceProbs,
    defenderFinalDiceProbsWithPx,
    pxIsRelevant,
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


export function calcDamage(
  attacker: Model,
  defender: Model,
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

  if (defender.has(Ability.JustAScratch)) {
    if (critHits > 0) {
      critHits--;
    } else if (normHits > 0) {
      normHits--;
    }
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

  // TODO: make the above decisions take Durable into account
  if(defender.has(Ability.Durable) && attacker.critDmg > MinCritDmgAfterDurable && critHits > 0) {
    damage -= 1;
  }

  return damage;
}
