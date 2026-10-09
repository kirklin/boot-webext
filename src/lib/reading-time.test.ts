import { describe, expect, it } from "vitest";
import { measureReading } from "./reading-time";

describe("measureReading", () => {
  it("counts the words of text that separates them with spaces", () => {
    expect(measureReading("The quick brown fox jumps over the lazy dog.")).toEqual({ words: 9, minutes: 1 });
  });

  it("counts Chinese text by words instead of characters", () => {
    const text = "浏览器扩展可以读取网页内容";
    const { words } = measureReading(text);

    expect(words).toBeGreaterThan(1);
    expect(words).toBeLessThan(text.length);
  });

  it("rounds up to whole minutes and never shows less than one", () => {
    expect(measureReading("word ".repeat(200)).minutes).toBe(1);
    expect(measureReading("word ".repeat(201)).minutes).toBe(2);
    expect(measureReading("").minutes).toBe(1);
  });
});
