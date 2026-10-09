import { LinkIcon, PanelRightIcon, SettingsIcon } from "lucide-react";
import { useState } from "react";
import { browser } from "#imports";
import { PageHeader } from "~/components/page-header";
import { TabStatus } from "~/components/tab-status";
import { Button } from "~/components/ui/button";
import { useActiveTab } from "~/hooks/use-active-tab";
import { sendMessage } from "~/lib/messaging";
import { openSidePanel } from "~/lib/side-panel";

export default function App() {
  const activeTab = useActiveTab();
  const windowId = activeTab?.windowId;
  const [copiedLink, setCopiedLink] = useState<string>();

  // Opening the side panel needs the click's user gesture, so it must come before any await.
  const showSidePanel = (id: number) => void openSidePanel(id).then(() => window.close());
  // The background builds the link and writes the clipboard, the same way the context menu and shortcut do.
  const copyPageLink = async (id: number) => setCopiedLink(await sendMessage("copyPageLink", id));

  return (
    <main className="flex w-80 flex-col gap-4 p-4">
      <PageHeader title="Popup" context="popup" />
      <TabStatus activeTab={activeTab} />
      <div className="grid grid-cols-2 gap-2">
        <Button onClick={() => void browser.runtime.openOptionsPage()}>
          <SettingsIcon />
          Open options
        </Button>
        <Button variant="outline" disabled={windowId === undefined} onClick={() => showSidePanel(windowId!)}>
          <PanelRightIcon />
          Open side panel
        </Button>
        <Button className="col-span-2" variant="secondary" disabled={windowId === undefined} onClick={() => void copyPageLink(windowId!)}>
          <LinkIcon />
          Copy page link
        </Button>
      </div>
      {copiedLink && (
        <p className="truncate text-xs text-muted-foreground" data-testid="copied-link">{`Copied ${copiedLink}`}</p>
      )}
    </main>
  );
}
