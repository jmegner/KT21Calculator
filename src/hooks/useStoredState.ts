import { Dispatch, SetStateAction, useCallback, useState } from 'react';
import { readChoices, writeChoices } from 'src/ChoiceStorage';

export function useStoredState<T>(key: string, createDefaults: () => T): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState(() => readChoices(key, createDefaults));
  const update = useCallback((action: SetStateAction<T>) => {
    setState(previous => {
      const next = typeof action === 'function' ? (action as (value: T) => T)(previous) : action;
      // Save with the update so a refresh immediately after an edit retains it.
      writeChoices(key, next);
      return next;
    });
  }, [key]);
  return [state, update];
}

export function fieldSetter<T>(setState: Dispatch<SetStateAction<T>>) {
  return <K extends keyof T>(key: K) => (value: T[K]) => setState(previous => ({...previous, [key]: value}));
}
