import Ability from "./Ability";
import Attacker from "./Attacker";
import Defender from "./Defender";
import Die from "./Die";
import { factorial } from 'mathjs';

export enum DieResult {
    Fail,
    Normal,
    Crit,
}

class DieOutcomeProbs {
  public crit: number;
  public norm: number;
  public fail: number;

  public constructor(
    crit: number,
    norm: number,
    fail: number,
  )
  {
    this.crit = crit;
    this.norm = norm;
    this.fail = fail;
  }

  public static FromAttacker(attacker: Attacker) : DieOutcomeProbs {
    // BEFORE taking ceaseless and relentless into account
    let failHitProb = (attacker.bs - 1) / 6;
    const critSkill = Die.Valid(attacker.lethalx) ? attacker.lethalx : 6;
    let critHitProb = (7 - critSkill) / 6;
    let normHitProb = (critSkill - attacker.bs) / 6;

    // now to take ceaseless and relentless into account...
    if(attacker.reroll === Ability.Ceaseless || attacker.reroll === Ability.Relentless) {
      const rerollMultiplier = (attacker.reroll === Ability.Ceaseless)
        ? 7 / 6
        : (attacker.bs + 5) / 6;
      critHitProb *= rerollMultiplier;
      normHitProb *= rerollMultiplier;
      failHitProb = 1 - critHitProb - normHitProb;
    }

    return new DieOutcomeProbs(critHitProb, normHitProb, failHitProb);
  }

  public static FromDefender(defender: Defender) : DieOutcomeProbs {
    const critSaveProb = 1/6;
    const normSaveProb = (6 - defender.save) / 6;
    const failSaveProb = (defender.save - 1) / 6;
    return new DieOutcomeProbs(
      critSaveProb,
      normSaveProb,
      failSaveProb,
    );
  }
}

class DamageOutcome {
  public damage: number;
  public prob: number;

  public constructor(damage: number, prob: number) {
    this.damage = damage;
    this.prob = prob;
  }
}

export function analyzeScenario(attacker: Attacker, defender: Defender) {
    // phase1: loop over all possible outcomes of all die and print the propabilities
    // we are not looping over die roll of {1,3,3,4,6}; we are looping over {2 normal hits, 1 crit hit, 2 normal saves}
    // phase2: group results by final outcome {2 normal damaging hits}

    // TODO: attacker and defender are independent, so it'd be nice to generate attacker possibilities,
    // then separately generate defender possibilities, then do loop that combines them
    // attackerFunc returns overall probability and revised critHits & normHits

    // TODO: make SingleDieOutcomeProbs with {crit, norm, fail} because that is reused

    let damageToProb = new Map<number,number>();

    for(let critHits = 0; critHits <= attacker.attacks; critHits++) {
        for (let normHits = 0; normHits <= attacker.attacks - critHits; normHits++) {
            let numDefDice = defender.defense;

            if(!Die.Valid(defender.invulnSave)) {
                const numDefDiceAfterAp = defender.defense - attacker.apx;
                const numDefDiceAfterP = (critHits > 0
                    ? defender.defense - attacker.px
                    : defender.defense);
                numDefDice = Math.min(numDefDiceAfterAp, numDefDiceAfterP);
            }

            let coverSaves = (numDefDice > 0 && defender.cover) ? 1 : 0;

            for(let critSaves = 0; critSaves <= numDefDice - coverSaves; critSaves++) {
                for (let normSaves = 0; normSaves <= numDefDice - coverSaves - critSaves; normSaves++) {
                    const missedSaves = numDefDice - coverSaves - critSaves - normSaves;
                    const outcome = calcOutcome(attacker, defender, critHits, normHits, critSaves, normSaves, coverSaves, missedSaves);
                    let prob = damageToProb.get(outcome.damage);

                    if(prob === undefined) {
                      prob = 0;
                    }

                    prob += outcome.prob;
                    damageToProb.set(outcome.damage, prob);
                }
            }

        }
    }

    return damageToProb;
}

function calcAttackerProbabilityAndFinalDice(
    attacker: Attacker,
    probs: DieOutcomeProbs,
    critHits: number,
    normHits: number,
)
{
  // TODO

}

function calcOutcome(
    attacker: Attacker,
    defender: Defender,
    critHits: number,
    normHits: number,
    critSaves: number,
    normSaves: number,
    coverSaves: number,
    failSaves: number,
): DamageOutcome
{
  // inputs are interpreted as BEFORE Rending/Starfire (die outcome transformers)
  // and AFTER all reroll abilities (Balanced, Ceaseless, Relentless)

  // BEFORE taking ceaseless and relentless into account
  let failHitProb = (attacker.bs - 1) / 6;
  const critSkill = Die.Valid(attacker.lethalx) ? attacker.lethalx : 6;
  let critHitProb = (7 - critSkill) / 6;
  let normHitProb = (critSkill - attacker.bs) / 6;

  // now to take ceaseless and relentless into account...
  if(attacker.reroll === Ability.Ceaseless || attacker.reroll === Ability.Relentless) {
    const hitMultiplier = (attacker.reroll === Ability.Ceaseless)
      ? 7 / 6
      : (attacker.bs + 5) / 6;
    critHitProb *= hitMultiplier;
    normHitProb *= hitMultiplier;
    failHitProb = 1 - critHitProb - normHitProb;
  }

  let failHits = attacker.attacks - critHits - normHits;

  // defender stuff...
  // TODO: chitin/defender-balanced
  const critSaveProb = 1/6;
  const normSaveProb = (6 - defender.save) / 6;
  const failSaveProb = 1 - critSaveProb - normSaveProb;

  let attackProb = multirollProbability(critHits, critHitProb, normHits, normHitProb, failHits, failHitProb);

  // there are multiple ways to get to this {crits,norms,fails} via OriginalRoll + BalancedRoll
  if(attacker.reroll === Ability.Balanced) {
    // if have {c,n,f}, then could be because...
    //    was {c,n,f>0} then balanced-rolled f
    //    was {c-1,n,f+1} then balanced-rolled c
    //    was {c,n-1,f+1} then balanced-rolled n

    attackProb = failHits > 0 ? attackProb * failHitProb : 0;

    if(critHits > 0) {
      attackProb += critHitProb * multirollProbability(critHits - 1, critHitProb, normHits, normHitProb, failHits + 1, failHitProb)
    }

    if(normHits > 0) {
      attackProb += normHitProb * multirollProbability(critHits, critHitProb, normHits - 1, normHitProb, failHits + 1, failHitProb)
    }
  }

  let defenseProb = multirollProbability(critSaves, critSaveProb, normSaves, normSaveProb, failSaves, failSaveProb);

  // chitin is Balanced for defender, so same logic here
  if(defender.chitin) {
    defenseProb = failSaves > 0 ? defenseProb * failSaveProb : 0;

    if(critSaves > 0) {
      defenseProb += critSaveProb * multirollProbability(critSaves - 1, critSaveProb, normSaves, normSaveProb, failSaves + 1, failSaveProb)
    }

    if(normSaves > 0) {
      defenseProb += normSaveProb * multirollProbability(critSaves, critSaveProb, normSaves - 1, normSaveProb, failSaves + 1, failSaveProb)
    }
  }

  const overallProb = attackProb * defenseProb;

  if(attacker.rending) {
    if(critHits > 0 && normHits > 0) {
      critHits++;
      normHits--;
    }
  }

  if(attacker.starfire) {
    if(critHits > 0 && failHits > 0) {
      critHits++;
      failHits--;
    }
  }

  const damage = calcDamage(attacker, critHits, normHits, critSaves, normSaves + coverSaves);
  const outcome = new DamageOutcome(damage, overallProb);
  return outcome;
}

function calcDamage(
  attacker: Attacker,
  critHits: number,
  normHits: number,
  critSaves: number,
  normSaves: number,
) : number
{
  // possible TODO: memoization of results indexed by [crit > norm][hits and saves]
  let damage = critHits * attacker.mwx;

  // cc, cn, nn, nc
  if (attacker.criticalDamage >= attacker.normalDamage) {
    const critSavesCancelingCritHits = Math.min(critSaves, critHits);
    critSaves -= critSavesCancelingCritHits;
    critHits -= critSavesCancelingCritHits;

    const critSavesCancelingNormHits = Math.min(critSaves, normHits);
    critSaves -= critSavesCancelingNormHits;
    normHits -= critSavesCancelingNormHits;

    const normSavesCancelingNormHits = Math.min(normSaves, normHits);
    normSaves -= normSavesCancelingNormHits;
    normHits -= normSavesCancelingNormHits;

    const critHitsCanceledByNormSavePairs = Math.min((normSaves / 2) >> 0, critHits);
    normSaves -= critHitsCanceledByNormSavePairs * 2;
    critHits -= critHitsCanceledByNormSavePairs;
  }
  // nn, cn, cc, nc
  else {
    const normSavesCancelingNormHits = Math.min(normSaves, normHits);
    normSaves -= normSavesCancelingNormHits;
    normHits -= normSavesCancelingNormHits;

    const critSavesCancelingNormHits = Math.min(critSaves, normHits);
    critSaves -= critSavesCancelingNormHits;
    normHits -= critSavesCancelingNormHits;

    const critSavesCancelingCritHits = Math.min(critSaves, critHits);
    critSaves -= critSavesCancelingCritHits;
    critHits -= critSavesCancelingCritHits;

    const critHitsCanceledByNormSavePairs = Math.min((normSaves / 2) >> 0, critHits);
    normSaves -= critHitsCanceledByNormSavePairs * 2;
    critHits -= critHitsCanceledByNormSavePairs;
  }

  damage += critHits * attacker.criticalDamage + normHits * attacker.normalDamage;
  return damage;
}

function multirollProbability(
  numCrits: number,
  probCrit: number,
  numNorms: number,
  probNorm: number,
  numFail: number,
  probFail: number,
)
{
  const prob
    = Math.pow(probCrit, numCrits)
    * Math.pow(probNorm, numNorms)
    * Math.pow(probFail, numFail)
    * factorial(numCrits + numNorms + numFail)
    / factorial(numCrits)
    / factorial(numNorms)
    / factorial(numFail)
    ;
  return prob;
}
