import App from './App';
import Attacker from './Attacker';
import { calcDamageProbabilities, exportedForTesting } from './KT21CalcEngine';

const {
  DieOutcomeProbs,
  FinalDiceProb,
  calcFinalDiceProb,
  multirollProbability,
  calcDamage,
} = exportedForTesting;

function calcDamageTest() {
  let nd = 5; // normal damage
  let cd = 7; // critical damage
  let mwd = 100; // mortal wound damage
  let atker = Attacker.justDamage(nd, cd, mwd);

  it('0ch 0nh vs 0cs 0ns => 0', () => {
    expect(calcDamage(atker, 0, 0, 0, 0)).toBe(0);
  });
  it('0ch 2nh vs 0cs 0ns => 2nd', () => {
    expect(calcDamage(atker, 0, 2, 0, 0)).toBe(2 * nd);
  });
  it('0ch 2nh vs 0cs 1ns => 1nd', () => {
    expect(calcDamage(atker, 0, 2, 0, 1)).toBe(nd);
  });
  it('0ch 2nh vs 1cs 1ns => 0', () => {
    expect(calcDamage(atker, 0, 2, 1, 1)).toBe(0);
  });
  it('0ch 2nh vs 3cs 3ns => 0', () => {
    expect(calcDamage(atker, 0, 2, 3, 3)).toBe(0);
  });
  it('1ch 0nh vs 0cs 1ns => 1mwd + 1cd', () => {
    expect(calcDamage(atker, 1, 0, 0, 1)).toBe(mwd + cd);
  });
  it('1ch 0nh vs 0cs 2ns => 1mwd', () => {
    expect(calcDamage(atker, 1, 0, 0, 2)).toBe(mwd);
  });
  it('1ch 1nh vs 0cs 2ns => 1mwd + 1nd', () => {
    expect(calcDamage(atker, 1, 1, 0, 2)).toBe(mwd + nd);
  });
  it('2ch 2nh vs 0cs 3ns => 2mwd + 1cd + 1nd', () => {
    expect(calcDamage(atker, 2, 2, 0, 3)).toBe(2 * mwd + cd + nd);
  });
  it('3ch 2nh vs 1cs 3ns => 3mwd + 1cd + 1nd', () => {
    expect(calcDamage(atker, 3, 2, 1, 3)).toBe(3 * mwd + cd + nd);
  });

  // now test with critHits being so big that normSaves should prefer to first cancel critHits
  nd = 10; // normal damage
  cd = 100; // critical damage
  mwd = 1000; // mortal wound damage
  atker = Attacker.justDamage(nd, cd, mwd);
  it('bigCrit, 0ch 0nh vs 0cs 0ns => 0', () => {
    expect(calcDamage(atker, 0, 0, 0, 0)).toBe(0);
  });
  it('bigCrit, 0ch 2nh vs 0cs 1ns => 1nd', () => {
    expect(calcDamage(atker, 0, 2, 0, 1)).toBe(nd);
  });
  it('bigCrit, 0ch 2nh vs 1cs 1ns => 0', () => {
    expect(calcDamage(atker, 0, 2, 1, 1)).toBe(0);
  });
  it('bigCrit, 0ch 2nh vs 3cs 3ns => 0', () => {
    expect(calcDamage(atker, 0, 2, 3, 3)).toBe(0);
  });
  it('1ch 0nh vs 0cs 1ns => 1mwd + 1cd', () => {
    expect(calcDamage(atker, 1, 0, 0, 1)).toBe(mwd + cd);
  });
  it('1ch 0nh vs 0cs 2ns => 1mwd', () => {
    expect(calcDamage(atker, 1, 0, 0, 2)).toBe(mwd);
  });
  it('1ch 2nh vs 0cs 2ns => 1mwd + 2nd', () => {
    expect(calcDamage(atker, 1, 2, 0, 2)).toBe(mwd + 2 * nd);
  });
  it('2ch 2nh vs 0cs 3ns => 2mwd + 1cd + 1nd', () => {
    expect(calcDamage(atker, 2, 2, 0, 3)).toBe(2 * mwd + cd + nd);
  });
}
calcDamageTest();

function multirollProbabilityTest() {
  // using >=1 probabilities so we can have prime factors and not worry about rounding errors
  const cp = 7; // crit probability
  const np = 11; // norm probability
  const fp = 13; // fail probability
  it('{0c,0n,1f} => fp^1', () => {
    expect(multirollProbability(0, cp, 0, np, 1, fp)).toBe(fp);
  });
  it('{0c,3n,0f} => np^3', () => {
    expect(multirollProbability(0, cp, 3, np, 0, fp)).toBe(Math.pow(np, 3));
  });
  it('{3c,0n,0f} * np * 3 = {2c,1n,0f} * cp', () => {
    expect(multirollProbability(3, cp, 0, np, 0, fp) * np * 3)
      .toBe(multirollProbability(2, cp, 1, np, 0, fp) * cp);
  });
  it('{1c,1n,1f} => cp*np*fp*(3!)', () => {
    expect(multirollProbability(1, cp, 1, np, 1, fp)).toBe(cp * np * fp * 6);
  });
}
multirollProbabilityTest();

function calcFinalDiceProbTest() {
  // using >=1 probabilities so we can have prime factors and not worry about rounding errors
  const cp = 7; // crit probability
  const np = 11; // norm probability
  const fp = 13; // fail probability
  const dieProbs = new DieOutcomeProbs(cp, np, fp);

  it('calcFinalDice, basic', () => {
    const actual = calcFinalDiceProb(dieProbs, 1, 0, 0, false);
    expect(actual).toStrictEqual(new FinalDiceProb(cp, 1, 0));
  });
  it('calcFinalDice, basic balanced 1c', () => {
    const actual = calcFinalDiceProb(dieProbs, 1, 0, 0, true);
    expect(actual).toStrictEqual(new FinalDiceProb(cp + fp * cp, 1, 0));
  });
  it('calcFinalDice, basic balanced 1f', () => {
    const actual = calcFinalDiceProb(dieProbs, 0, 0, 1, true);
    expect(actual).toStrictEqual(new FinalDiceProb(fp * fp, 0, 0));
  });
  it('calcFinalDice, rending {0c,1n,1f} => {0c,1n,1f}', () => {
    const actual = calcFinalDiceProb(dieProbs, 0, 1, 1, false, true);
    expect(actual).toStrictEqual(new FinalDiceProb(np * fp * 2, 0, 1));
  });
  it('calcFinalDice, rending {1c,0n,1f} => {1c,0n,1f}', () => {
    const actual = calcFinalDiceProb(dieProbs, 1, 0, 1, false, true);
    expect(actual).toStrictEqual(new FinalDiceProb(cp * fp * 2, 1, 0));
  });
  it('calcFinalDice, rending {1c,1n,0f} => {2c,0n,0f}', () => {
    const actual = calcFinalDiceProb(dieProbs, 1, 1, 0, false, true);
    expect(actual).toStrictEqual(new FinalDiceProb(cp * np * 2, 2, 0));
  });
  it('calcFinalDice, rending {3c,3n,3f} => {4c, 3n, 2f}', () => {
    const actual = calcFinalDiceProb(dieProbs, 3, 3, 0, false, true);
    expect(actual.crits).toBe(4);
    expect(actual.norms).toBe(2);
  });
  it('calcFinalDice, starfire {0c,1n,1f} => {0c,1n,1f}', () => {
    const actual = calcFinalDiceProb(dieProbs, 0, 1, 1, false, false, true);
    expect(actual).toStrictEqual(new FinalDiceProb(np * fp * 2, 0, 1));
  });
  it('calcFinalDice, starfire {1c,0n,1f} => {1c,1n,0f}', () => {
    const actual = calcFinalDiceProb(dieProbs, 1, 0, 1, false, false, true);
    expect(actual).toStrictEqual(new FinalDiceProb(cp * fp * 2, 1, 1));
  });
  it('calcFinalDice, starfire {1c,1n,0f} => {1c,1n,0f}', () => {
    const actual = calcFinalDiceProb(dieProbs, 1, 1, 0, false, false, true);
    expect(actual).toStrictEqual(new FinalDiceProb(cp * np * 2, 1, 1));
  });
  it('calcFinalDice, starfire {3c,3n,3f} => {3c,4n,2f}', () => {
    const actual = calcFinalDiceProb(dieProbs, 3, 3, 3, false, false, true);
    expect(actual.crits).toBe(3);
    expect(actual.norms).toBe(4);
  });
}
calcFinalDiceProbTest();

function calcDamageProbabilitiesTest() {
  const cp = 1/6; // crit probability
  const np = 1/3; // norm probability
  const fp = 1/2; // fail probability
  const dieProbs = new DieOutcomeProbs(cp, np, fp);
  const atker = new Attacker(1, 4, 11, 13);

  it('calcFinalDice, basic', () => {
    const actual = calcFinalDiceProb(dieProbs, 1, 0, 0, false);
    expect(actual).toStrictEqual(new FinalDiceProb(cp, 1, 0));
  });
}
calcDamageProbabilitiesTest();