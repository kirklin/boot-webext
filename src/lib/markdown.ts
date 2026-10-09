/** Formats a Markdown link, escaping the characters that would end the link text or URL early. */
export function formatMarkdownLink(title: string, url: string) {
  const text = title.replaceAll("\\", "\\\\").replaceAll("[", "\\[").replaceAll("]", "\\]");
  const href = url.replaceAll("(", "%28").replaceAll(")", "%29").replaceAll(" ", "%20");
  return `[${text}](${href})`;
}
