import { describe, expect, it } from "vitest";
import { formatMarkdownLink } from "./markdown";

describe("formatMarkdownLink", () => {
  it("puts the title and URL into a link", () => {
    expect(formatMarkdownLink("Example Domain", "https://example.com/")).toBe("[Example Domain](https://example.com/)");
  });

  it("escapes characters that would end the link text early", () => {
    expect(formatMarkdownLink("[Draft] C:\\notes", "https://example.com/")).toBe("[\\[Draft\\] C:\\\\notes](https://example.com/)");
  });

  it("encodes parentheses and spaces in the URL", () => {
    expect(formatMarkdownLink("Foo", "https://en.wikipedia.org/wiki/Foo_(bar) baz"))
      .toBe("[Foo](https://en.wikipedia.org/wiki/Foo_%28bar%29%20baz)");
  });
});
