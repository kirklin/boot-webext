import { ClockIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "~/components/ui/badge";
import { measureReading } from "~/lib/reading-time";

interface ReadingTimeProps {
  article: HTMLElement;
}

// `innerText` only holds the text a reader sees; `textContent` would also count
// scripts, styles and hidden elements inside the article.
function visibleText(element: HTMLElement) {
  // eslint-disable-next-line unicorn/prefer-dom-node-text-content
  return element.innerText;
}

export function ReadingTime({ article }: ReadingTimeProps) {
  const [stats, setStats] = useState(() => measureReading(visibleText(article)));

  // Pages load and change their text after the badge appears, so count again on every change.
  useEffect(() => {
    let frame = 0;
    const observer = new MutationObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setStats(measureReading(visibleText(article))));
    });
    observer.observe(article, { childList: true, subtree: true, characterData: true });
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [article]);

  return (
    <Badge variant="secondary" className="my-2 font-sans" data-testid="reading-time">
      <ClockIcon />
      {`${stats.minutes} min read · ${stats.words} words`}
    </Badge>
  );
}
