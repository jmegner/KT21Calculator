import DieProbs from 'src/DieProbs';
import FinalDiceProb from 'src/FinalDiceProb';
import * as Common from 'src/CalcEngineCommon';
import Ability from 'src/Ability';
import { calcMultiRoundDamage } from 'src/CalcEngineCommon';
import { weightedAverage } from 'src/Util';

export const requiredPrecision = 10;

describe(Common.calcMultiRollProb.name, () => {
  // using >=1 probabilities so we can have prime factors and not worry about rounding errors
  const pc = 7; // crit probability
  const pn = 11; // norm probability
  const pf = 13; // fail probability
  const dp = new DieProbs(pc, pn, pf);
  it('{0c,0n,1f} => pf^1', () => {
    expect(Common.calcMultiRollProb(dp, 0, 0, 1)).toBe(pf);
  });
  it('{0c,3n,0f} => pn^3', () => {
    expect(Common.calcMultiRollProb(dp, 0, 3, 0)).toBe(Math.pow(pn, 3));
  });
  it('{3c,0n,0f} * pn * 3 = {2c,1n,0f} * pc', () => {
    expect(Common.calcMultiRollProb(dp, 3, 0, 0) * pn * 3)
      .toBe(Common.calcMultiRollProb(dp, 2, 1, 0) * pc);
  });
  it('{1c,1n,1f} => pc*pn*pf*(3!)', () => {
    expect(Common.calcMultiRollProb(dp, 1, 1, 1)).toBe(pc * pn * pf * 6);
  });
});

function expectClose(
  actual: FinalDiceProb,
  expectedProb: number,
  expectedCrits?: number,
  expectedNorms?: number,
  ): void {
  if(expectedCrits !== undefined) {
    expect(actual.crits).toEqual(expectedCrits);
  }
  if(expectedNorms !== undefined) {
    expect(actual.norms).toEqual(expectedNorms);
  }
  expect(actual.prob).toBeCloseTo(expectedProb, requiredPrecision)
}

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

    expect(weightedAverage(dmgsMultiRound))
      .toBeCloseTo(weightedAverage(dmgsSingleRound) * numRounds, requiredPrecision);
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

    expect(weightedAverage(dmgsMultiRound))
      .toBeCloseTo(weightedAverage(dmgsSingleRound) * numRounds, requiredPrecision);
  });
});

describe(Common.calcFinalDiceProb.name, () => {
  const pc = 1 / 6; // crit probability
  const pn = 3 / 6; // norm probability
  const pf = 2 / 6; // fail probability
  const dieProbs = new DieProbs(pc, pn, pf);

  // only for CeaselessPlusBalanced
  const pcCeaseless = pc * 7 / 6;
  const pnCeaseless = pn * 7 / 6;
  const pfCeaseless = 1 - pcCeaseless - pnCeaseless;
  const dieProbsCeaseless = new DieProbs(pcCeaseless, pnCeaseless, pfCeaseless);
  const p1 = 1 / 6; // fail that can be rerolled by Ceaseless
  const p2 = pf - 1 / 6; // fail that can not be rerolled by Ceaseless

  const justRending = new Set<Ability>([Ability.Rending]);
  const justFailToNormIfCrit = new Set<Ability>([Ability.FailToNormIfCrit]);

  it('basic', () => {
    const actual = Common.calcFinalDiceProb(dieProbs, 1, 0, 0, Ability.None);
    expectClose(actual, pc, 1, 0);
  });
  it('basic balanced 1c', () => {
    const actual = Common.calcFinalDiceProb(dieProbs, 1, 0, 0, Ability.Balanced);
    expectClose(actual, pc + pf * pc, 1, 0);
  });
  it('basic balanced 1n', () => {
    const actual = Common.calcFinalDiceProb(dieProbs, 0, 1, 0, Ability.Balanced);
    expectClose(actual, pn + pf * pn, 0, 1);
  });
  it('basic balanced 1f', () => {
    const actual = Common.calcFinalDiceProb(dieProbs, 0, 0, 1, Ability.Balanced);
    expectClose(actual, pf * pf, 0, 0);
  });
  it('double balanced 1c', () => {
    const actual = Common.calcFinalDiceProb(dieProbs, 1, 0, 0, Ability.DoubleBalanced);
    expectClose(actual, pc + pf * pc);
  });
  it('double balanced 1f', () => {
    const actual = Common.calcFinalDiceProb(dieProbs, 0, 0, 1, Ability.DoubleBalanced);
    expectClose(actual, pf * pf);
  });
  it('double balanced 2c', () => {
    const actual = Common.calcFinalDiceProb(dieProbs, 2, 0, 0, Ability.DoubleBalanced);
    expectClose(actual, pc*pc + 2*pc*pf*pc + pf*pf*pc*pc);
  });
  it('double balanced 2f', () => {
    const actual = Common.calcFinalDiceProb(dieProbs, 0, 0, 2, Ability.DoubleBalanced);
    expectClose(actual, pf*pf*pf*pf);
  });
  it('double balanced {1c,1n}', () => {
    const actual = Common.calcFinalDiceProb(dieProbs, 1, 1, 0, Ability.DoubleBalanced);
    expectClose(actual, 2*pc*pn + 2*pc*pf*pn + 2*pn*pf*pc + pf*pf*2*pc*pn);
  });
  it('double balanced {3c}', () => {
    const actual = Common.calcFinalDiceProb(dieProbs, 3, 0, 0, Ability.DoubleBalanced);
    expectClose(actual, pc*pc*pc + 3*pc*pc*pf*pc + 3*pc*pf*pf*pc*pc);
  });
  it('double balanced {2c,1f}', () => {
    const actual = Common.calcFinalDiceProb(dieProbs, 2, 0, 1, Ability.DoubleBalanced);
    expectClose(actual, 3*pc*pc*pf*pf + 3*pc*pf*pf*2*pc*pf + pf*pf*pf*pc*pc);
  });
  it('basic CeaselessPlusBalanced 1c', () => {
    const actual = Common.calcFinalDiceProb(dieProbsCeaseless, 1, 0, 0, Ability.CeaselessPlusBalanced);
    expectClose(actual, pc + pf * pc, 1, 0);
  });
  it('basic CeaselessPlusBalanced 1n', () => {
    const actual = Common.calcFinalDiceProb(dieProbsCeaseless, 0, 1, 0, Ability.CeaselessPlusBalanced);
    expectClose(actual, pn + pf*pn, 0, 1);
  });
  it('basic CeaslessPlusBalanced 1f', () => {
    const actual = Common.calcFinalDiceProb(dieProbsCeaseless, 0, 0, 1, Ability.CeaselessPlusBalanced);
    expectClose(actual, pf*pf, 0, 0);
  });
  it('CeaslessPlusBalanced 2c', () => {
    const actual = Common.calcFinalDiceProb(dieProbsCeaseless, 2, 0, 0, Ability.CeaselessPlusBalanced);
    expectClose(actual, pc*pc + 2*pc*pc*pf + pc*pc*p1*p1 + 2*pc*pc*p1*p2, 2, 0);
  });
  it('CeaslessPlusBalanced 2f', () => {
    const actual = Common.calcFinalDiceProb(dieProbsCeaseless, 0, 0, 2, Ability.CeaselessPlusBalanced);
    expectClose(actual, p1*p1*pf*pf + 2*p1*p1*pf*pf + p2*p2*pf, 0, 0);
  });
  it('rending {0c,1n,1f} => {0c,1n,1f}', () => {
    const actual = Common.calcFinalDiceProb(dieProbs, 0, 1, 1, Ability.None, 0, 0, 0, 0, justRending);
    expectClose(actual, pn * pf * 2, 0, 1);
  });
  it('rending {1c,0n,1f} => {1c,0n,1f}', () => {
    const actual = Common.calcFinalDiceProb(dieProbs, 1, 0, 1, Ability.None, 0, 0, 0, 0, justRending);
    expectClose(actual, pc * pf * 2, 1, 0);
  });
  it('rending {1c,1n,0f} => {2c,0n,0f}', () => {
    const actual = Common.calcFinalDiceProb(dieProbs, 1, 1, 0, Ability.None, 0, 0, 0, 0, justRending);
    expectClose(actual, pc * pn * 2, 2, 0);
  });
  it('rending {3c,3n,3f} => {4c, 3n, 2f}', () => {
    const actual = Common.calcFinalDiceProb(dieProbs, 3, 3, 0, Ability.None, 0, 0, 0, 0, justRending);
    expect(actual.crits).toBe(4);
    expect(actual.norms).toBe(2);
  });
  it('starfire {0c,1n,1f} => {0c,1n,1f}', () => {
    const actual = Common.calcFinalDiceProb(dieProbs, 0, 1, 1, Ability.None, 0, 0, 0, 0, justFailToNormIfCrit);
    expect(actual).toStrictEqual(new FinalDiceProb(pn * pf * 2, 0, 1));
  });
  it('starfire {1c,0n,1f} => {1c,1n,0f}', () => {
    const actual = Common.calcFinalDiceProb(dieProbs, 1, 0, 1, Ability.None, 0, 0, 0, 0, justFailToNormIfCrit);
    expectClose(actual, pc * pf * 2, 1, 1);
  });
  it('starfire {1c,1n,0f} => {1c,1n,0f}', () => {
    const actual = Common.calcFinalDiceProb(dieProbs, 1, 1, 0, Ability.None, 0, 0, 0, 0, justFailToNormIfCrit);
    expectClose(actual, pc * pn * 2, 1, 1);
  });
  it('starfire {3c,3n,3f} => {3c,4n,2f}', () => {
    const actual = Common.calcFinalDiceProb(dieProbs, 3, 3, 3, Ability.None, 0, 0, 0, 0, justFailToNormIfCrit);
    expect(actual.crits).toBe(3);
    expect(actual.norms).toBe(4);
  });
  it('autoNormHits=1 + 1n => 2n', () => {
    const actual = Common.calcFinalDiceProb(dieProbs, 0, 1, 0, Ability.None, 0, 1,);
    expectClose(actual, pn, 0, 2);
  });
});

/*
describe('q', () => {
  it('x', () => {
    expect(0).toBe(0);
  });
});

*/