import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { fakeBrowser } from "wxt/testing/fake-browser";
import { storage } from "#imports";
import { storageDemo } from "~/lib/storage";
import { useStorageItem } from "./use-storage-item";

describe("useStorageItem", () => {
  beforeEach(() => {
    fakeBrowser.reset();
  });

  it("starts with the fallback and becomes ready after reading storage", async () => {
    await storageDemo.setValue("Saved before");
    const { result } = renderHook(() => useStorageItem(storageDemo));

    expect(result.current[0]).toBe("Storage Demo");
    expect(result.current[2]).toBe(false);

    await waitFor(() => expect(result.current[2]).toBe(true));
    expect(result.current[0]).toBe("Saved before");
  });

  it("writes updates to storage", async () => {
    const { result } = renderHook(() => useStorageItem(storageDemo));
    await waitFor(() => expect(result.current[2]).toBe(true));

    await act(() => result.current[1]("Updated"));

    expect(result.current[0]).toBe("Updated");
    expect(await storageDemo.getValue()).toBe("Updated");
  });

  it("follows changes made by other contexts", async () => {
    const { result } = renderHook(() => useStorageItem(storageDemo));
    await waitFor(() => expect(result.current[2]).toBe(true));

    await act(() => storageDemo.setValue("Changed elsewhere"));

    await waitFor(() => expect(result.current[0]).toBe("Changed elsewhere"));
  });

  it("follows other contexts again once its own writes have been reported back", async () => {
    const { result } = renderHook(() => useStorageItem(storageDemo));
    await waitFor(() => expect(result.current[2]).toBe(true));

    const update = result.current[1];
    await act(() => Promise.all(["T", "Ty", "Typ", "Type"].map(text => update(text))));

    expect(result.current[0]).toBe("Type");
    expect(await storageDemo.getValue()).toBe("Type");

    await act(() => storageDemo.setValue("Changed elsewhere"));
    await waitFor(() => expect(result.current[0]).toBe("Changed elsewhere"));
  });

  it("treats objects with the same entries in another order as the same value", async () => {
    const position = storage.defineItem<{ x: number; y: number }>("local:position", {
      fallback: { x: 0, y: 0 },
    });
    const { result } = renderHook(() => useStorageItem(position));
    await waitFor(() => expect(result.current[2]).toBe(true));

    await act(() => position.setValue({ y: 2, x: 1 }));
    await waitFor(() => expect(result.current[0]).toEqual({ x: 1, y: 2 }));

    // Storage reports nothing for this write, so it must not be waited for.
    await act(() => result.current[1]({ x: 1, y: 2 }));
    await act(() => position.setValue({ x: 3, y: 4 }));

    await waitFor(() => expect(result.current[0]).toEqual({ x: 3, y: 4 }));
  });

  it("throws when updated before the stored value has been read", async () => {
    const { result } = renderHook(() => useStorageItem(storageDemo));

    await expect(result.current[1]("Too early")).rejects.toThrow("before its stored value was read");

    await waitFor(() => expect(result.current[2]).toBe(true));
    expect(result.current[0]).toBe("Storage Demo");
  });
});
