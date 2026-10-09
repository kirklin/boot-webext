import { describe, expect, it } from "vitest";
import { parsePageRequestSnapshot } from "./page-requests";

describe("parsePageRequestSnapshot", () => {
  it("reads a snapshot from its JSON string", () => {
    const snapshot = { count: 2, recent: [{ method: "POST", url: "https://example.com/api" }] };

    expect(parsePageRequestSnapshot(JSON.stringify(snapshot))).toEqual(snapshot);
  });

  it("throws for details that are not snapshots", () => {
    expect(() => parsePageRequestSnapshot({ count: 1, recent: [] })).toThrow("must be a JSON string");
    expect(() => parsePageRequestSnapshot("not json")).toThrow(SyntaxError);
    expect(() => parsePageRequestSnapshot("null")).toThrow("must be an object");
    expect(() => parsePageRequestSnapshot(JSON.stringify({ count: -1, recent: [] }))).toThrow("count of zero or more");
    expect(() => parsePageRequestSnapshot(JSON.stringify({ count: 1, recent: [{ method: "GET" }] }))).toThrow("with a method and a URL");
    expect(() => parsePageRequestSnapshot(JSON.stringify({ count: 1, recent: Array.from({ length: 6 }, () => ({ method: "GET", url: "/" })) }))).toThrow("up to 5 requests");
  });
});
