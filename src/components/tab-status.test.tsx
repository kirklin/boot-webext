import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { fakeBrowser } from "wxt/testing/fake-browser";
import { storageDemo } from "~/lib/storage";
import { TabStatus } from "./tab-status";

describe("tabStatus", () => {
  beforeEach(() => {
    fakeBrowser.reset();
  });

  it("shows the active tab and the stored value", async () => {
    await storageDemo.setValue("Hello");
    render(<TabStatus activeTab={{ title: "Example Domain" }} />);

    expect(screen.getByTestId("active-tab").textContent).toBe("Example Domain");
    expect((await screen.findByText("Hello")).dataset.testid).toBe("storage-value");
  });

  it("shows a dash before the active tab is known", () => {
    render(<TabStatus activeTab={undefined} />);

    expect(screen.getByTestId("active-tab").textContent).toBe("-");
  });

  it("updates when storage changes", async () => {
    render(<TabStatus activeTab={undefined} />);
    expect(await screen.findByText("Storage Demo")).toBeDefined();

    await act(() => storageDemo.setValue("Changed"));

    expect(await screen.findByText("Changed")).toBeDefined();
  });
});
