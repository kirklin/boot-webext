import { browser } from "#imports";

interface PageHeaderProps {
  title: string;
  context: string;
}

export function PageHeader({ title, context }: PageHeaderProps) {
  return (
    <header className="flex flex-col items-center gap-1 text-center">
      <a href="https://github.com/kirklin/boot-webext" target="_blank" rel="noreferrer" title="GitHub">
        <img src={browser.runtime.getURL("/icon/128.png")} alt="Boot WebExt" className="size-12" />
      </a>
      <h1 className="text-lg font-semibold">{title}</h1>
      <p className="text-sm text-muted-foreground">{`This is the ${context} page.`}</p>
    </header>
  );
}
