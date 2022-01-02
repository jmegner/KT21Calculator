import App from './App';
import Attacker from './Attacker';
import Defender from './Defender';
import DefenderControls from './components/DefenderControls';
import { calcDamageProbabilities, exportedForTesting } from './KT21CalcEngine';
import * as Util from './Util';
import _ from 'lodash';
import Ability from './Ability';

const {
  DieProbs,
  FinalDiceProb,
  calcFinalDiceProb,
  multirollProbability,
  calcDamage,
} = exportedForTesting;

const requiredPrecision = 10;

function newTestAttacker(attacks: number = 1, bs: number = 4) : Attacker {
  return new Attacker(attacks, bs, 11, 13);
}

function avgDmg(attacker: Attacker, defender: Defender): number {
  return Util.weightedAverage(calcDamageProbabilities(attacker, defender));
}

describe('calcDamage', () => {
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

describe('multirollProbability', () => {
  // using >=1 probabilities so we can have prime factors and not worry about rounding errors
  const pc = 7; // crit probability
  const pn = 11; // norm probability
  const pf = 13; // fail probability
  it('{0c,0n,1f} => pf^1', () => {
    expect(multirollProbability(0, pc, 0, pn, 1, pf)).toBe(pf);
  });
  it('{0c,3n,0f} => pn^3', () => {
    expect(multirollProbability(0, pc, 3, pn, 0, pf)).toBe(Math.pow(pn, 3));
  });
  it('{3c,0n,0f} * pn * 3 = {2c,1n,0f} * pc', () => {
    expect(multirollProbability(3, pc, 0, pn, 0, pf) * pn * 3)
      .toBe(multirollProbability(2, pc, 1, pn, 0, pf) * pc);
  });
  it('{1c,1n,1f} => pc*pn*pf*(3!)', () => {
    expect(multirollProbability(1, pc, 1, pn, 1, pf)).toBe(pc * pn * pf * 6);
  });
});

describe('calcFinalDiceProb', () => {
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

describe('calcDamageProbabilities, few dice, no abilities', () => {
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

describe('calcDamageProbabilities, mwx', () => {
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

describe('calcDamageProbabilities, APx & invuln', () => {
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

describe('calcDamageProbabilities, px and lethalx', () => {
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
    const pa = DieProbs.fromAttacker(atk);

    const dmgs = calcDamageProbabilities(atk, def);
    expect(dmgs.get(0)).toBeCloseTo(pa.norm, requiredPrecision);
    expect(dmgs.get(atk.criticalDamage)).toBeCloseTo(pa.crit, requiredPrecision);
    expect(dmgs.size).toBe(2);
  });
});

describe('calcDamageProbabilities, balanced', () => {
  it('balanced with 1 atk die', () => {
    const atk = newTestAttacker(1).setProp('reroll', Ability.Balanced);
    const pa = DieProbs.fromAttacker(atk);
    const def = new Defender(0);

    const dmgs = calcDamageProbabilities(atk, def);
    expect(dmgs.get(0)).toBeCloseTo(pa.fail * pa.fail, requiredPrecision);
    expect(dmgs.get(atk.normalDamage)).toBeCloseTo(pa.norm + pa.fail * pa.norm, requiredPrecision);
    expect(dmgs.get(atk.criticalDamage)).toBeCloseTo(pa.crit + pa.fail * pa.crit, requiredPrecision);
    expect(dmgs.size).toBe(3);
  });
});

describe('calcDamageProbabilities, ceaseless', () => {
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

describe('calcDamageProbabilities, relentless', () => {
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

describe('calcDamageProbabilities, rending & starfire', () => {
  it('rending, 2 atk dice, probability 2 crits', () => {
    const atk = newTestAttacker(2).setProp('rending', true);
    const pa = DieProbs.fromAttacker(atk);
    const def = new Defender(0);

    const dmgs = calcDamageProbabilities(atk, def);
    expect(dmgs.get(2 * atk.criticalDamage)).toBeCloseTo(pa.crit * pa.crit + 2 * pa.crit * pa.norm, requiredPrecision);
  });
  it('starfire, 2 atk dice, probability 1 crit + 1 norm', () => {
    const atk = newTestAttacker(2).setProp('starfire', true);
    const pa = DieProbs.fromAttacker(atk);
    const def = new Defender(0);

    const dmgs = calcDamageProbabilities(atk, def);
    expect(dmgs.get(atk.criticalDamage + atk.normalDamage))
      .toBeCloseTo(2 * pa.crit * pa.fail + 2 * pa.crit * pa.norm, requiredPrecision);
  });
});

describe('calcDamageProbabilities, defender abilities', () => {
  it('TODO: fnp', () => {
    expect(0).toBe(0);
  });
  it('TODO: cover', () => {
    expect(0).toBe(0);
  });
  it('TODO: chitin', () => {
    expect(0).toBe(0);
  });
});

/*
describe('q', () => {
  it('x', () => {
    expect(0).toBe(0);
  });
});
*/