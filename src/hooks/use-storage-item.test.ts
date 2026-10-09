import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { fakeBrowser } from "wxt/testing/fake-browser";
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
});
