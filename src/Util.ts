import { range, clone, concat }  from 'lodash';
import { combinations } from 'mathjs';

export type Accepter<T> = (arg: T) => void;

export const thickX = 'X'; //'✖'; // the unicode ✖ shows up like a '+' in some fonts
export const thickCheck = '✔';
export const xAndCheck = [thickX, thickCheck];
export const centerHoriz = 'd-flex justify-content-center';
export const centerHorizVert = centerHoriz + ' align-items-center';

export function nameOf(obj: any) : string {
  return Object.keys(obj)[0];
}

export function parseIntZero(text: string) : number {
    const intAttempt = parseInt(text);
    return isNaN(intAttempt) ? 0 : intAttempt;
}

export function acceptNumToAcceptString(setter: Accepter<number>) : Accepter<string> {
  return function stringAccepter(text: string): void {
    setter(parseIntZero(text));
  }
}

export function acceptBoolToAcceptString(setter: Accepter<boolean>) : Accepter<string> {
  return function stringAccepter(text: string): void {
    setter(text === thickCheck);
  }
}

export function boolToCheckX(val: boolean) : string {
  return val ? thickCheck : thickX;
}

export function span(min: number, max: number, suffix?: string) : string[] {
  return range(min, max + 1).map(x => x.toString() + (suffix ? suffix : ''));
}

export function xspan(min: number, max: number, suffix?: string) : string[] {
  return concat([thickX], span(min, max, suffix));
}

export const rollSpan = span(2, 6, '+');
export const xrollSpan = preX(rollSpan);

export function preX(vals: string[]) : string[] {
  return concat([thickX], vals);
}

export function makePropChangeHandler<T>(
  obj: T,
  objChangeHandler: (t: T) => void,
  transformer?: (s: string) => any,
) : (propName: keyof T) => Accepter<string>
{
  return (propName: keyof T) => function handler(text: string) {
    let newObj = clone(obj);
    (newObj as any)[propName] = transformer === undefined ? text : transformer(text);
    objChangeHandler(newObj);
  };
}

export function makePropChangeHandlers<T>(
  obj: T,
  objChangeHandler: (t: T) => void,
) : ((propName: keyof T) => Accepter<string>)[]
{
  return [
    makePropChangeHandler(obj, objChangeHandler),
    makeNumChangeHandler(obj, objChangeHandler),
    makeBoolChangeHandler(obj, objChangeHandler),
  ];
}

export function makeNumChangeHandler<T>(
  obj: T,
  objChangeHandler: (t: T) => void,
) : (propName: keyof T) => Accepter<string>
{
  return makePropChangeHandler(obj, objChangeHandler, parseIntZero);
}

export function makeBoolChangeHandler<T>(
  obj: T,
  objChangeHandler: (t: T) => void,
) : (propName: keyof T) => Accepter<string>
{
  return makePropChangeHandler(obj, objChangeHandler, t => t === thickCheck);
}

export function nameof<TObject>(obj: TObject, key: keyof TObject): string;
export function nameof<TObject>(key: keyof TObject): string;
export function nameof(key1: any, key2?: any): any {
  return key2 ?? key1;
}

export function weightedAverage(valToWeight: Map<number,number>) : number {
  let avg = 0;
  valToWeight.forEach((weight, val) => { avg += val * weight; });
  return avg;
}

export function binomialPmf(
  numTrials: number,
  numSuccesses: number,
  probSuccess: number,
): number
{
  // often the variables are named numTrials=n, numSuccesses=k, probSuccess=p
  return combinations(numTrials, numSuccesses)
    * Math.pow(probSuccess, numSuccesses)
    * Math.pow(1 - probSuccess, numTrials - numSuccesses)
    ;
}

export function addToMapValue<T>(map: Map<T,number>, key: T, val: number): void {
  const oldMapVal = map.get(key) ?? 0;
  map.set(key, oldMapVal + val);
}

export function addMapValues<T>(mapToChange: Map<T,number>, mapToAdd: Map<T,number>): void {
  for(let [key, val] of mapToAdd) {
    addToMapValue(mapToChange, key, val);
  }
}

export function toPercentString(val: number, digitsPastDecimal: number = 2) {
  return (val * 100).toFixed(digitsPastDecimal);
}

export function toAscendingMap<V>(map: Map<number,V>): Map<number,V> {
  return new Map<number,V>([...map.entries()].sort((a, b) => a[0] - b[0]));
}

export function fillInProbForZero(keyToProb: Map<number, number>): void {
  let nonzeroValueProbSum = 0;
  keyToProb.forEach((prob, key) => {
    if(key != 0) {
      nonzeroValueProbSum += prob;
     }
  });

  if (nonzeroValueProbSum < 1) {
    keyToProb.set(0, 1 - nonzeroValueProbSum);
  }
}