import type { WxtStorageItem } from "#imports";
import { useCallback, useEffect, useRef, useState } from "react";

// Chrome hands objects back from storage with their keys sorted, so values are compared
// with sorted keys.
function serialize(value: unknown) {
  return JSON.stringify(value, (_key, nested: unknown) => {
    if (typeof nested !== "object" || nested === null || Array.isArray(nested)) {
      return nested;
    }
    return Object.fromEntries(Object.entries(nested).sort(([a], [b]) => (a < b ? -1 : 1)));
  });
}

/**
 * Binds a WXT storage item to React state. A change made in any context
 * (popup, options, side panel or a content script) reaches all of them.
 * `ready` turns true once the stored value has been read; updating before
 * that throws, so controls that write stay disabled until then.
 */
export function useStorageItem<T>(item: WxtStorageItem<T, Record<string, unknown>>) {
  const [value, setValue] = useState(item.fallback);
  const [ready, setReady] = useState(false);
  // What storage holds once the writes made from here have landed, serialized.
  // Undefined until a stored value has been read or reported.
  const storedRef = useRef<string | undefined>(undefined);
  // Values written from here and not yet reported back by `watch`, oldest first. Their
  // reports arrive after the state has moved on; applying them would put an input back to
  // what it said a few keystrokes earlier.
  const pendingWritesRef = useRef<string[]>([]);

  useEffect(() => {
    let active = true;
    const show = (next: T) => {
      storedRef.current = serialize(next);
      setValue(next);
    };

    void item.getValue().then((stored) => {
      if (!active) {
        return;
      }
      // A change reported while the read was in flight is at least as new as the value read.
      if (storedRef.current === undefined) {
        show(stored);
      }
      setReady(true);
    });
    const unwatch = item.watch((next) => {
      const pendingWrites = pendingWritesRef.current;
      if (pendingWrites.length > 0) {
        // Storage applies writes in order, so a change from elsewhere that lands between
        // writes from here is overwritten by them and is not shown.
        if (pendingWrites[0] === serialize(next)) {
          pendingWrites.shift();
        }
        return;
      }
      show(next);
    });
    return () => {
      active = false;
      unwatch();
    };
  }, [item]);

  const update = useCallback(async (next: T) => {
    // Before the read, a write that matches the stored value would never be reported back
    // and would stay pending.
    if (storedRef.current === undefined) {
      throw new Error(`"${item.key}" was updated before its stored value was read; wait for \`ready\``);
    }
    const serialized = serialize(next);
    // Storage reports nothing for a write that leaves the value as it was.
    if (serialized === storedRef.current) {
      return;
    }
    storedRef.current = serialized;
    setValue(next);
    pendingWritesRef.current.push(serialized);
    await item.setValue(next);
  }, [item]);

  return [value, update, ready] as const;
}
