import { range, clone, concat }  from 'lodash';
import { combinations } from 'mathjs';
import {Props as IncProps} from 'src/components/IncDecSelect';
import Note from 'src/Notes';

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

export function upTo(first: number, last?: number) : number[] {
  if (last === undefined) {
    return range(0, first + 1);
  }
  if(first > last) {
    return [];
  }
  return range(first, last + 1);
}

export function span(first: number, last: number, suffix?: string) : string[] {
  const delta = first <= last ? 1 : -1;
  return range(first, last + delta, delta).map(x => x.toString() + (suffix ? suffix : ''));
}

export function xspan(min: number, max: number, suffix?: string) : string[] {
  return concat([thickX], span(min, max, suffix));
}

export function withPlus(elems: any[]) : string[] {
  return elems.map(elem => elem.toString() + '+');
}

export const rollSpan = span(2, 6, '+');
export const xrollSpan = preX(rollSpan);

export function preX(vals: string[]) : string[] {
  return concat([thickX], vals);
}

export function makePropChangeHandlerFromLookup<ObjType,PropType>(
  obj: ObjType,
  objChangeHandler: (t: ObjType) => void,
  propName: keyof ObjType,
  internalValueToDisplayValue: Map<PropType,string>,
) : Accepter<string>
{
  return function handler(chosenText: string) {
    for(let [internalValue, displayValue] of internalValueToDisplayValue.entries()) {
      if(displayValue === chosenText) {
        let newObj = clone(obj);
        newObj[propName] = internalValue as any;
        objChangeHandler(newObj);
        return;
      }
    }
  };
}

export function makeIncDecPropsFromLookup<ObjType,PropType>(
  titleOrNote: string | Note,
  obj: ObjType,
  objChangeHandler: (t: ObjType) => void,
  propName: keyof ObjType,
  internalValueToDisplayValue: Map<PropType,string>,
): IncProps
{
  return new IncProps(
    titleOrNote,
    internalValueToDisplayValue.get(obj[propName] as unknown as PropType)!,
    Array.from(internalValueToDisplayValue.values()),
    makePropChangeHandlerFromLookup(obj, objChangeHandler, propName, internalValueToDisplayValue),
  );
}

export function incDecPropsHasNondefaultSelectedValue(incDecProps: IncProps) : boolean {
  return incDecProps.selectedValue !== incDecProps.values[0]
    && incDecProps.selectedValue !== "0"
    && incDecProps.selectedValue !== "0+"
    ;
}

export function makePropChangeHandler<T>(
  obj: T,
  objChangeHandler: (t: T) => void,
  transformer?: (s: string) => any,
) : (propName: keyof T) => Accepter<string>
{
  return (propName: keyof T) => function handler(text: string) {
    let newObj = clone(obj);
    newObj[propName] = transformer === undefined ? text : transformer(text);
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

export function makeSetChangeHandler<ObjType,ItemType>(
  obj: ObjType,
  objChangeHandler: (t: ObjType) => void,
  setName: keyof ObjType,
  mutuallyExclusiveItems: Iterable<ItemType>,
) : Accepter<string>
{
  return function handler(text: string) {
    let newObj = clone(obj);
    const newSet = new Set<ItemType>(newObj[setName] as unknown as Set<ItemType>);
    newObj[setName] = newSet as any;

    for(const item of mutuallyExclusiveItems) {
      newSet.delete(item);
    }

    newSet.add(text as unknown as ItemType);
    objChangeHandler(newObj);
  };
}

export function makeSetChangeHandlerForSingle<ObjType,ItemType>(
  obj: ObjType,
  objChangeHandler: (t: ObjType) => void,
  setName: keyof ObjType,
  desiredItem: ItemType,
) : Accepter<string>
{
  return function handler(text: string) {
    let newObj = clone(obj);
    const newSet = new Set<ItemType>(newObj[setName] as unknown as Set<ItemType>);
    newObj[setName] = newSet as any;

    if(text as unknown as ItemType === desiredItem
      || text === thickCheck) {
      newSet.add(desiredItem as unknown as ItemType);
    }
    else {
      newSet.delete(desiredItem as unknown as ItemType);
    }

    objChangeHandler(newObj);
  };
}

export function makeSetExtractor<ItemType>(
  relevantItems: Iterable<ItemType>,
  defaultItem: ItemType | null = null,
): (allItems: Set<ItemType>) => ItemType | null
{
  return function extractor(allItems: Set<ItemType>): ItemType | null {
    for(const relevantItem of relevantItems) {
      if(allItems.has(relevantItem)) {
        return relevantItem;
      }
    }
    return defaultItem;
  }
}

export function extractFromSet<ItemType>(
  relevantItems: Iterable<ItemType>,
  defaultItem: ItemType | null = null,
  theSet: Set<ItemType>
): ItemType | null
{
  return makeSetExtractor(relevantItems, defaultItem)(theSet);
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

export function standardDeviation(valToProb: Map<number,number>) : number {
  // variance = sum(x^2*px) - sum(x*px)^2
  let sumOfSquares = 0;
  let sum = 0;
  for(const [val, prob] of valToProb.entries()) {
    const weightedVal = val * prob;
    sum += weightedVal;
    sumOfSquares += weightedVal * val;
  }

  const stdDev = Math.sqrt(sumOfSquares - sum*sum);
  return stdDev;
}

export function killProb(dmgToProb: Map<number,number>, wounds: number): number {
  let probSum = 0;
  for(const [dmg, prob] of dmgToProb) {
    if(dmg >= wounds) {
      probSum += prob;
    }
  }
  return probSum;
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

export function normalizeMapValues<T>(map: Map<T,number>, denominator = NaN): void {
  if(isNaN(denominator)) {
    denominator = 0;
    for(let val of map.values()) {
      denominator += val;
    }
  }

  for(let [key, val] of map) {
    map.set(key, val / denominator);
  }
}

export function toPercentString(val: number, digitsPastDecimal: number = 2) {
  return (val * 100).toFixed(digitsPastDecimal);
}

export function toAscendingMap<V>(map: Map<number,V>): Map<number,V> {
  return new Map<number,V>(
    [...map.entries()]
    .sort((a, b) => a[0] - b[0])
  );
}

export function fillInProbForZero(keyToProb: Map<number, number>): void {
  let nonzeroValueProbSum = 0;
  keyToProb.forEach((prob, key) => {
    if(key !== 0) {
      nonzeroValueProbSum += prob;
     }
  });

  if (nonzeroValueProbSum < 1) {
    keyToProb.set(0, 1 - nonzeroValueProbSum);
  }
}

export function addOrRemove<T>(theSet: Set<T>, item: T, wantAdd: boolean): void {
  if(wantAdd) {
    theSet.add(item);
  }
  else {
    theSet.delete(item);
  }
}

export function executeAndMeasureMs(
  func: () => void,
  msg: string = '',
): number {
  const startTimeMs = performance.now();
  func();
  const endTimeMs = performance.now();
  const durationMs = endTimeMs - startTimeMs;
  if(msg) {
    console.debug(`${msg}: ${durationMs} ms`);
  }
  return endTimeMs - startTimeMs;
}

export function forceTo<InType extends {},OutType>(input: InType, outClass: {new(): OutType;}): OutType {
  const output = new outClass();
  Object.keys(input).forEach((key) => {
    output[key as keyof OutType] = input[key as keyof InType] as any;
  });
  return output;
}

export function requiredAndOptionalItemsToTwoCols<T>(
  requiredItems: T[],
  optionalItems: T[] = [],
  includeOptional: boolean = true,
) : [T[],T[]]
{
  const requiredItemsSplitIndex = (requiredItems.length + 1) / 2; // +1 to prefer left col
  let itemsCol0 = requiredItems.slice(0, requiredItemsSplitIndex);
  let itemsCol1 = requiredItems.slice(requiredItemsSplitIndex);

  if(includeOptional) {
    const optionalItemsSplitIndex = optionalItems.length / 2; // no +1 so that we prefer right col
    itemsCol0 = itemsCol0.concat(optionalItems.slice(0, optionalItemsSplitIndex));
    itemsCol1 = itemsCol1.concat(optionalItems.slice(optionalItemsSplitIndex));
  }

  return [itemsCol0, itemsCol1];
}