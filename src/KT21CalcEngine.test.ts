import App from './App';
import Attacker from './Attacker';
import Defender from './Defender';
import DefenderControls from './components/DefenderControls';
import { calcDamageProbabilities, exportedForTesting } from './KT21CalcEngine';
import * as Util from './Util';
import _ from 'lodash';
import Ability from './Ability';
import { combinations, factorial } from 'mathjs';

const {
  DieProbs,
  FinalDiceProb,
  calcDamage,
  calcFinalDiceProb,
  calcMultiRollProb,
  calcMultiRoundDamage,
  withFnpAppliedToDamages,
} = exportedForTesting;

const requiredPrecision = 10;

function newTestAttacker(attacks: number = 1, bs: number = 4) : Attacker {
  return new Attacker(attacks, bs, 11, 13);
}

function avgDmg(attacker: Attacker, defender: Defender, numRounds: number = 1): number {
  return Util.weightedAverage(calcDamageProbabilities(attacker, defender, numRounds));
}

describe(calcDamage.name, () => {
  let dn = 5; // normal damage
  let dc = 7; // critical damage
  let dmw = 100; // mortal wound damage
  let atker = Attacker.justDamage(dn, dc, dmw);

  it('0ch 0nh vs 0cs 0ns => 0', () => {
    expect(calcDamage(atker, 0, 0, 0, 0)).toBe(0);
  });
  it('0ch 2nh vs 0cs 0ns => 2dn', () => {
    expect(calcDamage(atker, 0, 2, 0, 0)).toBe(2 * dn);
  });
  it('0ch 2nh vs 0cs 1ns => 1dn', () => {
    expect(calcDamage(atker, 0, 2, 0, 1)).toBe(dn);
  });
  it('0ch 2nh vs 1cs 1ns => 0', () => {
    expect(calcDamage(atker, 0, 2, 1, 1)).toBe(0);
  });
  it('0ch 2nh vs 3cs 3ns => 0', () => {
    expect(calcDamage(atker, 0, 2, 3, 3)).toBe(0);
  });
  it('1ch 0nh vs 0cs 1ns => 1dmw + 1dc', () => {
    expect(calcDamage(atker, 1, 0, 0, 1)).toBe(dmw + dc);
  });
  it('1ch 0nh vs 0cs 2ns => 1dmw', () => {
    expect(calcDamage(atker, 1, 0, 0, 2)).toBe(dmw);
  });
  it('1ch 1nh vs 0cs 2ns => 1dmw + 1dn', () => {
    expect(calcDamage(atker, 1, 1, 0, 2)).toBe(dmw + dn);
  });
  it('2ch 2nh vs 0cs 3ns => 2dmw + 1dc + 1dn', () => {
    expect(calcDamage(atker, 2, 2, 0, 3)).toBe(2 * dmw + dc + dn);
  });
  it('3ch 2nh vs 1cs 3ns => 3dmw + 1dc + 1dn', () => {
    expect(calcDamage(atker, 3, 2, 1, 3)).toBe(3 * dmw + dc + dn);
  });

  // now test with critHits being so big that normSaves should prefer to first cancel critHits
  dn = 10; // normal damage
  dc = 100; // critical damage
  dmw = 1000; // mortal wound damage
  atker = Attacker.justDamage(dn, dc, dmw);
  it('bigCrit, 0ch 0nh vs 0cs 0ns => 0', () => {
    expect(calcDamage(atker, 0, 0, 0, 0)).toBe(0);
  });
  it('bigCrit, 0ch 2nh vs 0cs 1ns => 1dn', () => {
    expect(calcDamage(atker, 0, 2, 0, 1)).toBe(dn);
  });
  it('bigCrit, 0ch 2nh vs 1cs 1ns => 0', () => {
    expect(calcDamage(atker, 0, 2, 1, 1)).toBe(0);
  });
  it('bigCrit, 0ch 2nh vs 3cs 3ns => 0', () => {
    expect(calcDamage(atker, 0, 2, 3, 3)).toBe(0);
  });
  it('1ch 0nh vs 0cs 1ns => 1dmw + 1dc', () => {
    expect(calcDamage(atker, 1, 0, 0, 1)).toBe(dmw + dc);
  });
  it('1ch 0nh vs 0cs 2ns => 1dmw', () => {
    expect(calcDamage(atker, 1, 0, 0, 2)).toBe(dmw);
  });
  it('1ch 2nh vs 0cs 2ns => 1dmw + 2dn', () => {
    expect(calcDamage(atker, 1, 2, 0, 2)).toBe(dmw + 2 * dn);
  });
  it('2ch 2nh vs 0cs 3ns => 2dmw + 1dc + 1dn', () => {
    expect(calcDamage(atker, 2, 2, 0, 3)).toBe(2 * dmw + dc + dn);
  });
});

describe(calcMultiRollProb.name, () => {
  // using >=1 probabilities so we can have prime factors and not worry about rounding errors
  const pc = 7; // crit probability
  const pn = 11; // norm probability
  const pf = 13; // fail probability
  it('{0c,0n,1f} => pf^1', () => {
    expect(calcMultiRollProb(0, pc, 0, pn, 1, pf)).toBe(pf);
  });
  it('{0c,3n,0f} => pn^3', () => {
    expect(calcMultiRollProb(0, pc, 3, pn, 0, pf)).toBe(Math.pow(pn, 3));
  });
  it('{3c,0n,0f} * pn * 3 = {2c,1n,0f} * pc', () => {
    expect(calcMultiRollProb(3, pc, 0, pn, 0, pf) * pn * 3)
      .toBe(calcMultiRollProb(2, pc, 1, pn, 0, pf) * pc);
  });
  it('{1c,1n,1f} => pc*pn*pf*(3!)', () => {
    expect(calcMultiRollProb(1, pc, 1, pn, 1, pf)).toBe(pc * pn * pf * 6);
  });
});

describe(calcFinalDiceProb.name, () => {
  // using >=1 probabilities so we can have prime factors and not worry about rounding errors
  const pc = 7; // crit probability
  const pn = 11; // norm probability
  const pf = 13; // fail probability
  const dieProbs = new DieProbs(pc, pn, pf);

  it('basic', () => {
    const actual = calcFinalDiceProb(dieProbs, 1, 0, 0, false);
    expect(actual).toStrictEqual(new FinalDiceProb(pc, 1, 0));
  });
  it('basic balanced 1c', () => {
    const actual = calcFinalDiceProb(dieProbs, 1, 0, 0, true);
    expect(actual).toStrictEqual(new FinalDiceProb(pc + pf * pc, 1, 0));
  });
  it('basic balanced 1f', () => {
    const actual = calcFinalDiceProb(dieProbs, 0, 0, 1, true);
    expect(actual).toStrictEqual(new FinalDiceProb(pf * pf, 0, 0));
  });
  it('rending {0c,1n,1f} => {0c,1n,1f}', () => {
    const actual = calcFinalDiceProb(dieProbs, 0, 1, 1, false, true);
    expect(actual).toStrictEqual(new FinalDiceProb(pn * pf * 2, 0, 1));
  });
  it('rending {1c,0n,1f} => {1c,0n,1f}', () => {
    const actual = calcFinalDiceProb(dieProbs, 1, 0, 1, false, true);
    expect(actual).toStrictEqual(new FinalDiceProb(pc * pf * 2, 1, 0));
  });
  it('rending {1c,1n,0f} => {2c,0n,0f}', () => {
    const actual = calcFinalDiceProb(dieProbs, 1, 1, 0, false, true);
    expect(actual).toStrictEqual(new FinalDiceProb(pc * pn * 2, 2, 0));
  });
  it('rending {3c,3n,3f} => {4c, 3n, 2f}', () => {
    const actual = calcFinalDiceProb(dieProbs, 3, 3, 0, false, true);
    expect(actual.crits).toBe(4);
    expect(actual.norms).toBe(2);
  });
  it('starfire {0c,1n,1f} => {0c,1n,1f}', () => {
    const actual = calcFinalDiceProb(dieProbs, 0, 1, 1, false, false, true);
    expect(actual).toStrictEqual(new FinalDiceProb(pn * pf * 2, 0, 1));
  });
  it('starfire {1c,0n,1f} => {1c,1n,0f}', () => {
    const actual = calcFinalDiceProb(dieProbs, 1, 0, 1, false, false, true);
    expect(actual).toStrictEqual(new FinalDiceProb(pc * pf * 2, 1, 1));
  });
  it('starfire {1c,1n,0f} => {1c,1n,0f}', () => {
    const actual = calcFinalDiceProb(dieProbs, 1, 1, 0, false, false, true);
    expect(actual).toStrictEqual(new FinalDiceProb(pc * pn * 2, 1, 1));
  });
  it('starfire {3c,3n,3f} => {3c,4n,2f}', () => {
    const actual = calcFinalDiceProb(dieProbs, 3, 3, 3, false, false, true);
    expect(actual.crits).toBe(3);
    expect(actual.norms).toBe(4);
  });
});

describe(withFnpAppliedToDamages.name, () => {
  it('single prefnp damage of 3', () => {
    const fnp = 5;
    const pd = 2 / 3; // probability damage gets through
    const pa = 1 / 3; // probability avoided the damage
    const preFnpDmgs = new Map<number,number>([ [3, 1], ]);
    const postFnpDmgs = withFnpAppliedToDamages(fnp, preFnpDmgs);

    expect(postFnpDmgs.get(1)).toBeCloseTo(Math.pow(pd, 1) * Math.pow(pa, 2) * 3, requiredPrecision);
    expect(postFnpDmgs.get(2)).toBeCloseTo(Math.pow(pd, 2) * Math.pow(pa, 1) * 3, requiredPrecision);
    expect(postFnpDmgs.get(3)).toBeCloseTo(Math.pow(pd, 3) * Math.pow(pa, 0) * 1, requiredPrecision);
    expect(postFnpDmgs.size).toBe(3);
  });
  it('single prefnp damage of 4', () => {
    const fnp = 5;
    const pd = 2 / 3; // probability damage gets through
    const pa = 1 / 3; // probability avoided the damage
    const preFnpDmgs = new Map<number,number>([ [4, 1], ]);
    const postFnpDmgs = withFnpAppliedToDamages(fnp, preFnpDmgs);

    expect(postFnpDmgs.get(1)).toBeCloseTo(Math.pow(pd, 1) * Math.pow(pa, 3) * 4, requiredPrecision);
    expect(postFnpDmgs.get(2)).toBeCloseTo(Math.pow(pd, 2) * Math.pow(pa, 2) * 6, requiredPrecision);
    expect(postFnpDmgs.get(3)).toBeCloseTo(Math.pow(pd, 3) * Math.pow(pa, 1) * 4, requiredPrecision);
    expect(postFnpDmgs.get(4)).toBeCloseTo(Math.pow(pd, 4) * Math.pow(pa, 0) * 1, requiredPrecision);
    expect(postFnpDmgs.size).toBe(4);
  });
  it('prefnp damages of 1 & 2', () => {
    const fnp = 5;
    const pd = 2 / 3; // probability damage gets through
    const pa = 1 / 3; // probability avoided the damage
    const p1 = 0.25; // probability of prefnp damage = 1
    const p2 = 1 - p1; // probability of prefnp damage = 2
    const preFnpDmgs = new Map<number,number>([
      [1, p1],
      [2, p2],
    ]);
    const postFnpDmgs = withFnpAppliedToDamages(fnp, preFnpDmgs);

    expect(postFnpDmgs.get(1)).toBeCloseTo(p2 * pd * pa * 2 + p1 * pd, requiredPrecision);
    expect(postFnpDmgs.get(2)).toBeCloseTo(p2 * pd * pd, requiredPrecision);
    expect(postFnpDmgs.size).toBe(2);
  });
});

describe(calcMultiRoundDamage.name, () => {
  it('rounds=1 means no change', () => {
    const dmgsSingleRound = new Map<number, number>([
      [0, 0.5],
      [10, 0.375],
      [100, 0.125],
    ]);
    const dmgsMultiRound = calcMultiRoundDamage(dmgsSingleRound, 1);
    expect(dmgsMultiRound).toStrictEqual(dmgsSingleRound);
  });
  it('rounds=2', () => {
    const [d0, d3, d6] = [0,   3,   6];
    const [p0, p3, p6] = [0.5, 0.25, 0.25];
    const dmgsSingleRound = new Map<number, number>([
      [d0, p0],
      [d3, p3],
      [d6, p6],
    ]);
    const numRounds = 2;
    const dmgsMultiRound = calcMultiRoundDamage(dmgsSingleRound, numRounds);

    expect(dmgsMultiRound.get(d0)).toBeCloseTo(p0 * p0, requiredPrecision);
    expect(dmgsMultiRound.get(d3)).toBeCloseTo(p0 * p3 * 2, requiredPrecision);
    expect(dmgsMultiRound.get(d6)).toBeCloseTo(p0 * p6 * 2 + p3 * p3, requiredPrecision);
    expect(dmgsMultiRound.get(d3 + d6)).toBeCloseTo(p3 * p6 * 2, requiredPrecision);
    expect(dmgsMultiRound.get(d6 + d6)).toBeCloseTo(p6 * p6, requiredPrecision);
    expect(dmgsMultiRound.size).toBe(5);

    expect(Util.weightedAverage(dmgsMultiRound))
      .toBeCloseTo(Util.weightedAverage(dmgsSingleRound) * numRounds, requiredPrecision);
  });
  it('rounds=3', () => {
    const [d0, d3, d6] = [0,   3,   6];
    const [p0, p3, p6] = [0.5, 0.25, 0.25];
    const dmgsSingleRound = new Map<number, number>([
      [d0, p0],
      [d3, p3],
      [d6, p6],
    ]);
    const numRounds = 3;
    const dmgsMultiRound = calcMultiRoundDamage(dmgsSingleRound, numRounds);

    expect(dmgsMultiRound.get(d0)).toBeCloseTo(p0 * p0 * p0, requiredPrecision);
    expect(dmgsMultiRound.get(d3)).toBeCloseTo(p0 * p0 * p3 * 3, requiredPrecision);
    expect(dmgsMultiRound.get(d6)).toBeCloseTo(p0 * p3 * p3 * 3 + p0 * p0 * p6 * 3, requiredPrecision);
    expect(dmgsMultiRound.get(d3 + d6)).toBeCloseTo(p0 * p3 * p6 * 6 + p3 * p3 * p3, requiredPrecision);
    expect(dmgsMultiRound.get(d6 + d6)).toBeCloseTo(p0 * p6 * p6 * 3 + p3 * p3 * p6 * 3, requiredPrecision);
    expect(dmgsMultiRound.get(d6 + d6 + d3)).toBeCloseTo(p3 * p6 * p6 * 3, requiredPrecision);
    expect(dmgsMultiRound.get(d6 + d6 + d6)).toBeCloseTo(p6 * p6 * p6, requiredPrecision);
    expect(dmgsMultiRound.size).toBe(7);

    expect(Util.weightedAverage(dmgsMultiRound))
      .toBeCloseTo(Util.weightedAverage(dmgsSingleRound) * numRounds, requiredPrecision);
  });
});

describe(calcDamageProbabilities.name + ', few dice, no abilities', () => {
  const bs = 4;
  const pc = 1/6; // crit probability
  const pn = 1/3; // norm probability
  const pf = 1/2; // fail probability
  const dc = 13;
  const dn = 11;
  const atk1 = new Attacker(1, bs, dn, dc);
  const atk2 = new Attacker(2, bs, dn, dc);
  const def0 = new Defender(0, bs);
  const def1 = new Defender(1, bs);

  it('test coherency', () => {
    expect(pc + pn + pf).toBeCloseTo(1, requiredPrecision);
  });
  it('1 atkDie vs 0 defDie', () => {
    const damageToProb = calcDamageProbabilities(atk1, def0);
    expect(damageToProb.size).toBe(3);
    expect(damageToProb.get(0)).toBe(pf);
    expect(damageToProb.get(dn)).toBe(pn);
    expect(damageToProb.get(dc)).toBe(pc);
  });
  it('2 atkDie vs 0 defDie', () => {
    const damageToProb = calcDamageProbabilities(atk2, def0);
    expect(damageToProb.size).toBe(6);
    expect(damageToProb.get(0)).toBeCloseTo(pf * pf, requiredPrecision);
    expect(damageToProb.get(dn)).toBeCloseTo(pn * pf * 2, requiredPrecision);
    expect(damageToProb.get(2 * dn)).toBeCloseTo(pn * pn, requiredPrecision);
    expect(damageToProb.get(dc)).toBeCloseTo(pc * pf * 2, requiredPrecision);
    expect(damageToProb.get(dc + dn)).toBeCloseTo(pc * pn * 2, requiredPrecision);
    expect(damageToProb.get(2 * dc)).toBeCloseTo(pc * pc, requiredPrecision);
  });
  it('1 atkDie vs 1 defDie', () => {
    const damageToProb = calcDamageProbabilities(atk1, def1);
    const probCritDelivered = pc * (1 - pc); // atk crit and def non-crit
    const probNormDelivered = pn * pf; // atk crit and def non-crit
    const probNothingDeliveredCalculatedDirectly = pf + pc * pc + pn * (1 - pf);
    const probNothingDeliveredCalculatedAsRemainder = 1 - probCritDelivered - probNormDelivered;

    // make sure test didn't mess up this calc
    expect(probNothingDeliveredCalculatedDirectly)
      .toBeCloseTo(probNothingDeliveredCalculatedAsRemainder, requiredPrecision);

    expect(damageToProb.size).toBe(3);
    expect(damageToProb.get(dc)).toBeCloseTo(pc * (1 - pc), requiredPrecision);
    expect(damageToProb.get(dn)).toBeCloseTo(pn * pf, requiredPrecision); // atk norm vs def fail
    expect(damageToProb.get(0)).toBeCloseTo(probNothingDeliveredCalculatedDirectly, requiredPrecision); // atk fail or atk cancelled
  });
  it('2 atkDie vs 1 defDie', () => {
    const damageToProb = calcDamageProbabilities(atk2, def1);

    const probNothingDelivered
      = pc * pf * 2 * pc // 1c vs 1c
      + pn * pf * 2 * (1 - pf) // 1n vs 1 not-fail
      + pf * pf // nothing vs anything
      ;
    const prob1NormDelivered
      = pc * pn * 2 * pc // 1c+1n vs 1c
      + pn * pn * (1 - pf) // 2n vs 1 not-fail
      + pn * pf * 2 * pf // 1n vs 1f
      ;
    const prob1CritDelivered
      = pc * pc * pc // 2c vs 1c
      + pc * pn * 2 * pn // 1c+1n vs 1n
      + pc * pf * 2 * (1 - pc) // 1c vs 1 not-crit
      ;
    const prob1Crit1NormDelivered = pc * pn * 2 * pf;
    const prob2NormDelivered = pn * pn * pf;
    const prob2CritDelivered = pc * pc * (1 - pc);

    // make sure test didn't mess up this calc
    expect(
      probNothingDelivered
      + prob1NormDelivered
      + prob1CritDelivered
      + prob1Crit1NormDelivered
      + prob2NormDelivered
      + prob2CritDelivered
      ).toBeCloseTo(1, requiredPrecision);

    expect(damageToProb.size).toBe(6);
    expect(damageToProb.get(0)).toBeCloseTo(probNothingDelivered, requiredPrecision);
    expect(damageToProb.get(dn)).toBeCloseTo(prob1NormDelivered, requiredPrecision);
    expect(damageToProb.get(dc)).toBeCloseTo(prob1CritDelivered, requiredPrecision);
    expect(damageToProb.get(dc + dn)).toBeCloseTo(prob1Crit1NormDelivered, requiredPrecision);
    expect(damageToProb.get(2 * dn)).toBeCloseTo(prob2NormDelivered, requiredPrecision);
    expect(damageToProb.get(2 * dc)).toBeCloseTo(prob2CritDelivered, requiredPrecision);
  });
});

describe(calcDamageProbabilities.name + ', mwx', () => {
  // we tested mwx for calcDamage; quick test to make sure calcDamageProbabilities respects mwx too
  it('basic', () => {
    const dmw = 1000; // mw damage
    const pc = 1 / 6;
    const pn = 5 / 6;
    const atk = newTestAttacker(1, 1).setProp('mwx', dmw);
    const def = new Defender(1, 1).withProp('invulnSave', 1);

    const dmgs = calcDamageProbabilities(atk, def);
    expect(dmgs.get(0)).toBeCloseTo(pn, requiredPrecision); // norm hit, any save
    expect(dmgs.get(dmw)).toBeCloseTo(pc * pc, requiredPrecision); // crit hit, crit save
    expect(dmgs.get(dmw + atk.criticalDamage)).toBeCloseTo(pn * pc, requiredPrecision); // crit hit, norm save
    expect(dmgs.size).toBe(3);
  });
});

describe(calcDamageProbabilities.name + ', APx & invuln', () => {
  it('APx vs fewer defense dice', () => {
    const atkApx0 = new Attacker().setProp('apx', 0);
    const atkApx1 = new Attacker().setProp('apx', 1);
    const atkApx2 = new Attacker().setProp('apx', 2);
    const def0 = new Defender().setProp('defense', 0);
    const def1 = new Defender().setProp('defense', 1);
    const def2 = new Defender().setProp('defense', 2);
    const def3 = new Defender().setProp('defense', 3);

    // scenarios with 0 defense dice (0-0, 1-1,);
    const dmgs0Minus0DefDice = calcDamageProbabilities(atkApx0, def0);
    const dmgs1Minus1DefDice = calcDamageProbabilities(atkApx1, def1);
    expect(dmgs0Minus0DefDice).toStrictEqual(dmgs1Minus1DefDice);

    // scenarios with 1 defense dice (1-0, 2-1, 3-2,);
    const dmgs1Minus0DefDice = calcDamageProbabilities(atkApx0, def1);
    const dmgs2Minus1DefDice = calcDamageProbabilities(atkApx1, def2);
    const dmgs3Minus2DefDice = calcDamageProbabilities(atkApx2, def3);
    expect(dmgs1Minus0DefDice).toStrictEqual(dmgs2Minus1DefDice);
    expect(dmgs1Minus0DefDice).toStrictEqual(dmgs3Minus2DefDice);

    // scenarios with 2 defense dice (2-0, 3-1,);
    const dmgs2Minus0DefDice = calcDamageProbabilities(atkApx0, def2);
    const dmgs3Minus1DefDice = calcDamageProbabilities(atkApx1, def3);
    expect(dmgs2Minus0DefDice).toStrictEqual(dmgs3Minus1DefDice);

    expect(Util.weightedAverage(dmgs2Minus0DefDice))
      .toBeLessThan(Util.weightedAverage(dmgs2Minus1DefDice));
    expect(Util.weightedAverage(dmgs1Minus0DefDice))
      .toBeLessThan(Util.weightedAverage(dmgs0Minus0DefDice));
  });
  it('invuln used when valid', () => {
    const atk = newTestAttacker(1).withAlwaysNormHit();
    const def = new Defender(1, 1); // never rolls fails
    const defInvuln = def.withProp('invulnSave', 4); // fails half the time

    const dmg = avgDmg(atk, def);
    expect(dmg).toStrictEqual(0); // normHit always cancelled

    const dmgInvuln = avgDmg(atk, defInvuln);
    expect(dmgInvuln).toStrictEqual(atk.normalDamage / 2); // normHit cancelled half the time
  });
  it('APx has no effect against invuln', () => {
    const atkApx0 = newTestAttacker(3).setProp('apx', 0);
    const atkApx1 = newTestAttacker(3).setProp('apx', 1);
    const def = new Defender(3, 3);
    const defInvuln = new Defender().setProp('invulnSave', 6);

    const dmgsApx0Invuln = calcDamageProbabilities(atkApx0, defInvuln);
    const dmgsApx1Invuln = calcDamageProbabilities(atkApx1, defInvuln);
    expect(dmgsApx0Invuln).toStrictEqual(dmgsApx1Invuln);

    const dmgsApx0 = calcDamageProbabilities(atkApx0, def);
    expect(Util.weightedAverage(dmgsApx0))
      .toBeLessThan(Util.weightedAverage(dmgsApx0Invuln));
  });
});

describe(calcDamageProbabilities.name + ', px and lethalx', () => {
  it('px gets rid of def dice on crit', () => {
    const atk = newTestAttacker(1, 1).setProp('px', 4).setProp('lethalx', 5);
    const pc = (7 - atk.critSkill()) / 6;
    const def = new Defender(4, 1);

    const dmgs = calcDamageProbabilities(atk, def);
    expect(dmgs.get(0)).toBeCloseTo(1 - pc, requiredPrecision);
    expect(dmgs.get(atk.criticalDamage)).toBeCloseTo(pc, requiredPrecision);
  });

  it('0 < apx < px, apx used when no crit', () => {
    const atk = newTestAttacker(1, 1).setProp('apx', 1).setProp('px', 2).setProp('lethalx', 5);
    const def = new Defender(2, 1);
    const [pc, pn, pf] = atk.toDieProbs().toCritNormFail();

    const dmgs = calcDamageProbabilities(atk, def);
    expect(dmgs.get(0)).toBeCloseTo(pn, requiredPrecision);
    expect(dmgs.get(atk.criticalDamage)).toBeCloseTo(pc, requiredPrecision);
    expect(dmgs.size).toBe(2);
  });
});

describe(calcDamageProbabilities.name + ', balanced', () => {
  it('balanced with 1 atk die', () => {
    const atk = newTestAttacker(1).setProp('reroll', Ability.Balanced);
    const [pc, pn, pf] = atk.toDieProbs().toCritNormFail();
    const def = new Defender(0);

    const dmgs = calcDamageProbabilities(atk, def);
    expect(dmgs.get(0)).toBeCloseTo(pf * pf, requiredPrecision);
    expect(dmgs.get(atk.normalDamage)).toBeCloseTo(pn + pf * pn, requiredPrecision);
    expect(dmgs.get(atk.criticalDamage)).toBeCloseTo(pc + pf * pc, requiredPrecision);
    expect(dmgs.size).toBe(3);
  });
});

describe(calcDamageProbabilities.name + ', ceaseless', () => {
  it('ceaseless with 1 atk die', () => {
    const atk = newTestAttacker(1).setProp('reroll', Ability.Ceaseless);
    const pc = 1 / 6;
    const pn = 2 / 6;
    const pf = 3 / 6;
    const p1 = 1 / 6; // probability of rolling exactly a 1
    const def = new Defender(0);

    const dmgs = calcDamageProbabilities(atk, def);
    expect(dmgs.get(0)).toBeCloseTo((pf - p1) + p1 * pf, requiredPrecision);
    expect(dmgs.get(atk.normalDamage)).toBeCloseTo(pn + p1 * pn, requiredPrecision);
    expect(dmgs.get(atk.criticalDamage)).toBeCloseTo(pc + p1 * pc, requiredPrecision);
    expect(dmgs.size).toBe(3);
  });
  it('ceaseless damage', () => {
    const atk = newTestAttacker(3);
    const atkCeaseless = atk.withProp('reroll', Ability.Ceaseless);
    const def = new Defender(0);

    const dmg = avgDmg(atk, def);
    const dmgCeaseless = avgDmg(atkCeaseless, def);
    expect(dmgCeaseless).toBeCloseTo(dmg * 7 / 6, requiredPrecision);
  });
});

describe(calcDamageProbabilities.name + ', relentless', () => {
  it('relentless with 1 atk die', () => {
    const atk = newTestAttacker(1).setProp('reroll', Ability.Relentless);
    const pc = 1 / 6;
    const pn = 2 / 6;
    const pf = 3 / 6;
    const def = new Defender(0);

    const dmgs = calcDamageProbabilities(atk, def);
    expect(dmgs.get(0)).toBeCloseTo(pf * pf, requiredPrecision);
    expect(dmgs.get(atk.normalDamage)).toBeCloseTo(pn + pf * pn, requiredPrecision);
    expect(dmgs.get(atk.criticalDamage)).toBeCloseTo(pc + pf * pc, requiredPrecision);
    expect(dmgs.size).toBe(3);
  });
  it('relentless damage', () => {
    const atk = newTestAttacker(3, 4);
    const atkRelentless = atk.withProp('reroll', Ability.Relentless);
    const def = new Defender(0);

    const dmg = avgDmg(atk, def);
    const dmgRelentless = avgDmg(atkRelentless, def);
    expect(dmgRelentless).toBeCloseTo(dmg * 1.5, requiredPrecision);
  });
});

describe(calcDamageProbabilities.name + ', rending & starfire', () => {
  it('rending, 2 atk dice, probability 2 crits', () => {
    const atk = newTestAttacker(2).setProp('rending', true);
    const [pc, pn, pf] = atk.toDieProbs().toCritNormFail();
    const def = new Defender(0);

    const dmgs = calcDamageProbabilities(atk, def);
    expect(dmgs.get(2 * atk.criticalDamage)).toBeCloseTo(pc * pc + 2 * pc * pn, requiredPrecision);
  });
  it('starfire, 2 atk dice, probability 1 crit + 1 norm', () => {
    const atk = newTestAttacker(2).setProp('starfire', true);
    const [pc, pn, pf] = atk.toDieProbs().toCritNormFail();
    const def = new Defender(0);

    const dmgs = calcDamageProbabilities(atk, def);
    expect(dmgs.get(atk.criticalDamage + atk.normalDamage))
      .toBeCloseTo(2 * pc * pf + 2 * pc * pn, requiredPrecision);
  });
});

describe(calcDamageProbabilities.name + ', defender abilities', () => {
  it('fnp with prefnp damages of 1 and 2', () => {
    // we already tested fnp at the withFnpAppliedToDamages level, quick redo at higher level
    const fnp = 5;
    const pd = 2 / 3; // probability damage gets through
    const pa = 1 / 3; // probability avoided the damage
    const p1 = 1 / 2; // probability of prefnp damage = 1
    const p2 = 1 / 6; // probability of prefnp damage = 2
    const atk = new Attacker(1, 3, 1, 2);
    const def = new Defender(0).setProp('fnp', fnp);

    const dmgs = calcDamageProbabilities(atk, def);
    expect(dmgs.get(1)).toBeCloseTo(p2 * pd * pa * 2 + p1 * pd, requiredPrecision);
    expect(dmgs.get(2)).toBeCloseTo(p2 * pd * pd, requiredPrecision);
    expect(dmgs.size).toBe(3);
  });
  it('cover, 1 always-norm-hit vs 1 cover save (always cancel)', () => {
    const atk = newTestAttacker(1).withAlwaysNormHit();
    const def = new Defender(1, 6).setProp('cover', true);

    const dmgs = calcDamageProbabilities(atk, def);
    expect(dmgs.get(0)).toBeCloseTo(1, requiredPrecision);
    expect(dmgs.size).toBe(1);
  });
  it('cover, 1 always-crit-hit vs 1 cover save (never cancel)', () => {
    const atk = newTestAttacker(1).withAlwaysCritHit();
    const def = new Defender(1, 6).setProp('cover', true);

    const dmgs = calcDamageProbabilities(atk, def);
    expect(dmgs.get(atk.criticalDamage)).toBeCloseTo(1, requiredPrecision);
    expect(dmgs.size).toBe(1);
  });
  it('cover, 2 always-norm-hit vs 1 cover save and 1 def roll (sometimes cancelled)', () => {
    const atk = newTestAttacker(2).withAlwaysNormHit();
    const def = new Defender(2, 3).setProp('cover', true);
    const [pc, pn, pf] = def.toDieProbs().toCritNormFail();

    const dmgs = calcDamageProbabilities(atk, def);
    expect(dmgs.get(0)).toBeCloseTo(pc + pn, requiredPrecision);
    expect(dmgs.get(atk.normalDamage)).toBeCloseTo(pf, requiredPrecision);
    expect(dmgs.size).toBe(2);
  });
  it('enough apx means not even a cover success', () => {
    const atk = newTestAttacker(1).withAlwaysNormHit().setProp('apx', 3);
    const def = new Defender(3);

    const dmgs = calcDamageProbabilities(atk, def);
    expect(dmgs.get(atk.normalDamage)).toBeCloseTo(1, requiredPrecision);
    expect(dmgs.size).toBe(1);
  });
  it('chitin, 1 atk die & 1 def die', () => {
    const atk = newTestAttacker(1, 4);
    const def = new Defender(1, 4).setProp('chitin', true);
    const [pc, pn, pf] = atk.toDieProbs().toCritNormFail();

    const dmgs = calcDamageProbabilities(atk, def);
    expect(dmgs.get(atk.criticalDamage)).toBeCloseTo(pc * (pf * (1 - pc) + pn), requiredPrecision);
    expect(dmgs.get(atk.normalDamage)).toBeCloseTo(pn * pf * pf, requiredPrecision);
    expect(dmgs.get(0)).toEqual(expect.any(Number)); // prob is just remainder
    expect(dmgs.size).toBe(3);
  });
});

describe(calcDamageProbabilities.name + ', multiple rounds', () => {
  it('damage should scale linearly', () => {
    const atk = newTestAttacker(3);
    const def = new Defender();
    const dmgHist = [];

    for(const numRounds of _.range(1, 6)) {
      dmgHist.push(avgDmg(atk, def, numRounds));
      expect(dmgHist[dmgHist.length - 1]).toBeCloseTo(dmgHist[0] * numRounds, requiredPrecision);
    }
  });
});

/*
describe('q', () => {
  it('x', () => {
    expect(0).toBe(0);
  });
});

*/