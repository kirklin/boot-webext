import type { WxtStorageItem } from "#imports";
import { useCallback, useEffect, useState } from "react";

/**
 * Binds a WXT storage item to React state. A change made in any context
 * (popup, options, side panel or a content script) reaches all of them.
 * `ready` turns true once the stored value has been read.
 */
export function useStorageItem<T>(item: WxtStorageItem<T, Record<string, unknown>>) {
  const [value, setValue] = useState(item.fallback);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    void item.getValue().then((stored) => {
      if (active) {
        setValue(stored);
        setReady(true);
      }
    });
    const unwatch = item.watch(next => setValue(next));
    return () => {
      active = false;
      unwatch();
    };
  }, [item]);

  const update = useCallback(async (next: T) => {
    setValue(next);
    await item.setValue(next);
  }, [item]);

  return [value, update, ready] as const;
}
