// Store choices, never class methods or WebAssembly memory addresses.
type StoredValue = null | boolean | number | string | StoredValue[] | {[key: string]: StoredValue};
const storagePrefix = 'ktcalc:v1:';

function choiceKeys(value: object): string[] {
  const keys = new Set(Object.keys(value).filter(key => !key.startsWith('__') && key !== 'ptr'));
  // wasm-bindgen exposes model fields as prototype accessors, not own properties.
  const prototype = Object.getPrototypeOf(value);
  if (prototype && prototype !== Object.prototype) {
    Object.entries(Object.getOwnPropertyDescriptors(prototype)).forEach(([key, descriptor]) => {
      if (descriptor.get && descriptor.set) keys.add(key);
    });
  }
  return [...keys];
}

export function serializeChoices(value: any): StoredValue {
  if (value === null || typeof value !== 'object') return value;
  if (value instanceof Set || Array.isArray(value)) return [...value].map(serializeChoices);
  return Object.fromEntries(choiceKeys(value).map(key => [key, serializeChoices(value[key])]));
}

// Hydrate fresh default instances so their prototypes, Sets, and WASM pointers survive.
// Only known fields with compatible types are restored; new fields keep their defaults.
export function restoreChoices<T>(defaults: T, stored: unknown): T {
  if (defaults instanceof Set) {
    return (Array.isArray(stored) && stored.every(item => typeof item === 'string')
      ? new Set(stored) : defaults) as T;
  }
  if (defaults !== null && typeof defaults === 'object') {
    if (!stored || typeof stored !== 'object' || Array.isArray(stored)) return defaults;
    for (const key of choiceKeys(defaults)) {
      if (Object.prototype.hasOwnProperty.call(stored, key)) {
        (defaults as any)[key] = restoreChoices((defaults as any)[key], (stored as any)[key]);
      }
    }
    return defaults;
  }
  if (typeof stored !== typeof defaults) return defaults;
  if (typeof stored === 'number' && !Number.isFinite(stored)) return defaults;
  return stored as T;
}

export function copyChoices<T>(value: T, createDefaults: () => T): T {
  return restoreChoices(createDefaults(), serializeChoices(value));
}

export function readChoices<T>(key: string, createDefaults: () => T): T {
  const defaults = createDefaults();
  try {
    const saved = localStorage.getItem(storagePrefix + key);
    return saved === null ? defaults : restoreChoices(defaults, JSON.parse(saved));
  } catch {
    return defaults;
  }
}

export function writeChoices<T>(key: string, value: T): void {
  try {
    localStorage.setItem(storagePrefix + key, JSON.stringify(serializeChoices(value)));
  } catch {
    // Keep the calculator usable when browser storage is blocked or full.
  }
}
