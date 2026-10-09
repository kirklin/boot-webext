import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Testing Library only unmounts automatically when Vitest globals are enabled.
afterEach(() => {
  cleanup();
});
