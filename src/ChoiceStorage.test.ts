import { copyChoices, readChoices, restoreChoices, serializeChoices, writeChoices } from './ChoiceStorage';
import Model from './Model';
import Ability from './Ability';

beforeEach(() => localStorage.clear());

test('copy preserves class methods and independently clones abilities and nested choices', () => {
  const defaults = () => ({attacker: new Model(), defender: Model.basicDefender(), rounds: 1, advanced: false});
  const original = defaults();
  original.attacker.diceStat = 5;
  original.attacker.abilities.add(Ability.Rending);
  original.advanced = true;
  original.rounds = 3;
  const copy = copyChoices(original, defaults);
  expect(copy.attacker).toBeInstanceOf(Model);
  expect(copy.attacker.has(Ability.Rending)).toBe(true);
  expect(copy).toEqual(original);
  copy.attacker.abilities.clear();
  copy.attacker.diceStat = 2;
  copy.defender.wounds = 1;
  expect(original.attacker.has(Ability.Rending)).toBe(true);
  expect(original.attacker.diceStat).toBe(5);
  expect(original.defender.wounds).toBe(12);
});

// Like wasm-bindgen, instances hold pointers and expose choices through accessors.
let nextPointer = 0;
const memory = new Map<number, number>();
class WasmModel {
  __wbg_ptr = ++nextPointer;
  constructor() { memory.set(this.__wbg_ptr, 3); }
  get dice() { return memory.get(this.__wbg_ptr)!; }
  set dice(value: number) { memory.set(this.__wbg_ptr, value); }
}

test('WASM accessors are copied without sharing or storing pointers', () => {
  const original = new WasmModel();
  original.dice = 7;
  expect(serializeChoices(original)).toEqual({dice: 7});
  const copy = copyChoices(original, () => new WasmModel());
  expect(copy.__wbg_ptr).not.toBe(original.__wbg_ptr);
  expect(copy.dice).toBe(7);
  copy.dice = 1;
  expect(original.dice).toBe(7);
  writeChoices('wasm', original);
  const restored = readChoices('wasm', () => new WasmModel());
  expect(restored.dice).toBe(7);
  expect(restored.__wbg_ptr).not.toBe(original.__wbg_ptr);
});

test('storage restores nested model choices, Sets, booleans and options', () => {
  const defaults = () => ({model: new Model(), advanced: false, options: {rounds: 1, first: 'A'}});
  const state = defaults();
  state.model.abilities.add(Ability.Rending);
  state.options = {rounds: 3, first: 'B'};
  state.advanced = true;
  writeChoices('fight', state);
  const restored = readChoices('fight', defaults);
  expect(restored).toEqual(state);
  expect(restored.model.has(Ability.Rending)).toBe(true);
});

test('different tabs and situations have separate storage, including clears', () => {
  const defaults = () => ({dice: 3});
  writeChoices('halo.s1', {dice: 5});
  writeChoices('halo.s2', {dice: 8});
  writeChoices('deadzone.s1', {dice: 9});
  writeChoices('halo.s1', defaults());
  expect(readChoices('halo.s1', defaults)).toEqual(defaults());
  expect(readChoices('halo.s2', defaults)).toEqual({dice: 8});
  expect(readChoices('deadzone.s1', defaults)).toEqual({dice: 9});
  writeChoices('view', 'HaloFlashpoint');
  expect(readChoices('view', () => 'KtShoot')).toBe('HaloFlashpoint');
});

test('missing, malformed and incompatible saved values fall back to defaults', () => {
  const defaults = () => ({dice: 3, enabled: false, abilities: new Set<string>()});
  expect(readChoices('missing', defaults)).toEqual(defaults());
  localStorage.setItem('ktcalc:v1:bad', '{');
  expect(readChoices('bad', defaults)).toEqual(defaults());
  expect(restoreChoices(defaults(), {dice: 'wrong', enabled: 1, abilities: {}})).toEqual(defaults());
  expect(restoreChoices(defaults(), {dice: Infinity})).toEqual(defaults());
  expect(restoreChoices(defaults(), {dice: 5, obsolete: true})).toEqual({...defaults(), dice: 5});
});

test('unknown fields and prototype injection are ignored', () => {
  const restored = restoreChoices(new Model(), JSON.parse('{"__proto__":{"bad":true},"has":"broken","numDice":5}'));
  expect(restored).toBeInstanceOf(Model);
  expect(restored.numDice).toBe(5);
  expect(restored.has(Ability.Rending)).toBe(false);
  expect(({} as any).bad).toBeUndefined();
});

test('unavailable storage does not break calculation choices', () => {
  const get = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
  expect(readChoices('model', () => new Model())).toBeInstanceOf(Model);
  get.mockRestore();
  const set = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('full'); });
  expect(() => writeChoices('model', new Model())).not.toThrow();
  set.mockRestore();
});
