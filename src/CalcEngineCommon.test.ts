import DieProbs from 'src/DieProbs';
import FinalDiceProb from 'src/FinalDiceProb';
import * as Common from 'src/CalcEngineCommon';

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

describe(Common.calcFinalDiceProb.name, () => {
  // using >=1 probabilities so we can have prime factors and not worry about rounding errors
  const pc = 7; // crit probability
  const pn = 11; // norm probability
  const pf = 13; // fail probability
  const dieProbs = new DieProbs(pc, pn, pf);

  it('basic', () => {
    const actual = Common.calcFinalDiceProb(dieProbs, 1, 0, 0, false);
    expect(actual).toStrictEqual(new FinalDiceProb(pc, 1, 0));
  });
  it('basic balanced 1c', () => {
    const actual = Common.calcFinalDiceProb(dieProbs, 1, 0, 0, true);
    expect(actual).toStrictEqual(new FinalDiceProb(pc + pf * pc, 1, 0));
  });
  it('basic balanced 1f', () => {
    const actual = Common.calcFinalDiceProb(dieProbs, 0, 0, 1, true);
    expect(actual).toStrictEqual(new FinalDiceProb(pf * pf, 0, 0));
  });
  it('rending {0c,1n,1f} => {0c,1n,1f}', () => {
    const actual = Common.calcFinalDiceProb(dieProbs, 0, 1, 1, false, true);
    expect(actual).toStrictEqual(new FinalDiceProb(pn * pf * 2, 0, 1));
  });
  it('rending {1c,0n,1f} => {1c,0n,1f}', () => {
    const actual = Common.calcFinalDiceProb(dieProbs, 1, 0, 1, false, true);
    expect(actual).toStrictEqual(new FinalDiceProb(pc * pf * 2, 1, 0));
  });
  it('rending {1c,1n,0f} => {2c,0n,0f}', () => {
    const actual = Common.calcFinalDiceProb(dieProbs, 1, 1, 0, false, true);
    expect(actual).toStrictEqual(new FinalDiceProb(pc * pn * 2, 2, 0));
  });
  it('rending {3c,3n,3f} => {4c, 3n, 2f}', () => {
    const actual = Common.calcFinalDiceProb(dieProbs, 3, 3, 0, false, true);
    expect(actual.crits).toBe(4);
    expect(actual.norms).toBe(2);
  });
  it('starfire {0c,1n,1f} => {0c,1n,1f}', () => {
    const actual = Common.calcFinalDiceProb(dieProbs, 0, 1, 1, false, false, true);
    expect(actual).toStrictEqual(new FinalDiceProb(pn * pf * 2, 0, 1));
  });
  it('starfire {1c,0n,1f} => {1c,1n,0f}', () => {
    const actual = Common.calcFinalDiceProb(dieProbs, 1, 0, 1, false, false, true);
    expect(actual).toStrictEqual(new FinalDiceProb(pc * pf * 2, 1, 1));
  });
  it('starfire {1c,1n,0f} => {1c,1n,0f}', () => {
    const actual = Common.calcFinalDiceProb(dieProbs, 1, 1, 0, false, false, true);
    expect(actual).toStrictEqual(new FinalDiceProb(pc * pn * 2, 1, 1));
  });
  it('starfire {3c,3n,3f} => {3c,4n,2f}', () => {
    const actual = Common.calcFinalDiceProb(dieProbs, 3, 3, 3, false, false, true);
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