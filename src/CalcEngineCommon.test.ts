import DieProbs from 'src/DieProbs';
import FinalDiceProb from 'src/FinalDiceProb';
import * as Common from 'src/CalcEngineCommon';
import Ability from 'src/Ability';

export const requiredPrecision = 10;

describe(Common.calcMultiRollProb.name, () => {
  // using >=1 probabilities so we can have prime factors and not worry about rounding errors
  const pc = 7; // crit probability
  const pn = 11; // norm probability
  const pf = 13; // fail probability
  it('{0c,0n,1f} => pf^1', () => {
    expect(Common.calcMultiRollProb(0, pc, 0, pn, 1, pf)).toBe(pf);
  });
  it('{0c,3n,0f} => pn^3', () => {
    expect(Common.calcMultiRollProb(0, pc, 3, pn, 0, pf)).toBe(Math.pow(pn, 3));
  });
  it('{3c,0n,0f} * pn * 3 = {2c,1n,0f} * pc', () => {
    expect(Common.calcMultiRollProb(3, pc, 0, pn, 0, pf) * pn * 3)
      .toBe(Common.calcMultiRollProb(2, pc, 1, pn, 0, pf) * pc);
  });
  it('{1c,1n,1f} => pc*pn*pf*(3!)', () => {
    expect(Common.calcMultiRollProb(1, pc, 1, pn, 1, pf)).toBe(pc * pn * pf * 6);
  });
});

function expectClose(
  actual: FinalDiceProb,
  expectedProb: number,
  expectedCrits: number,
  expectedNorms: number): void {
  expect(actual.crits).toEqual(expectedCrits);
  expect(actual.norms).toEqual(expectedNorms);
  expect(actual.prob).toBeCloseTo(expectedProb, requiredPrecision)
}

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
    const actual = Common.calcFinalDiceProb(dieProbs, 0, 1, 1, Ability.None, true);
    expectClose(actual, pn * pf * 2, 0, 1);
  });
  it('rending {1c,0n,1f} => {1c,0n,1f}', () => {
    const actual = Common.calcFinalDiceProb(dieProbs, 1, 0, 1, Ability.None, true);
    expectClose(actual, pc * pf * 2, 1, 0);
  });
  it('rending {1c,1n,0f} => {2c,0n,0f}', () => {
    const actual = Common.calcFinalDiceProb(dieProbs, 1, 1, 0, Ability.None, true);
    expectClose(actual, pc * pn * 2, 2, 0);
  });
  it('rending {3c,3n,3f} => {4c, 3n, 2f}', () => {
    const actual = Common.calcFinalDiceProb(dieProbs, 3, 3, 0, Ability.None, true);
    expect(actual.crits).toBe(4);
    expect(actual.norms).toBe(2);
  });
  it('starfire {0c,1n,1f} => {0c,1n,1f}', () => {
    const actual = Common.calcFinalDiceProb(dieProbs, 0, 1, 1, Ability.None, false, true);
    expect(actual).toStrictEqual(new FinalDiceProb(pn * pf * 2, 0, 1));
  });
  it('starfire {1c,0n,1f} => {1c,1n,0f}', () => {
    const actual = Common.calcFinalDiceProb(dieProbs, 1, 0, 1, Ability.None, false, true);
    expectClose(actual, pc * pf * 2, 1, 1);
  });
  it('starfire {1c,1n,0f} => {1c,1n,0f}', () => {
    const actual = Common.calcFinalDiceProb(dieProbs, 1, 1, 0, Ability.None, false, true);
    expectClose(actual, pc * pn * 2, 1, 1);
  });
  it('starfire {3c,3n,3f} => {3c,4n,2f}', () => {
    const actual = Common.calcFinalDiceProb(dieProbs, 3, 3, 3, Ability.None, false, true);
    expect(actual.crits).toBe(3);
    expect(actual.norms).toBe(4);
  });
});

/*
describe('q', () => {
  it('x', () => {
    expect(0).toBe(0);
  });
});

*/