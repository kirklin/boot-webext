import { PanelRightIcon, SettingsIcon } from "lucide-react";
import { browser } from "#imports";
import { PageHeader } from "~/components/page-header";
import { TabStatus } from "~/components/tab-status";
import { Button } from "~/components/ui/button";
import { useActiveTab } from "~/hooks/use-active-tab";

export default function App() {
  const activeTab = useActiveTab();
  const windowId = activeTab?.windowId;

  return (
    <main className="flex w-80 flex-col gap-4 p-4">
      <PageHeader title="Popup" context="popup" />
      <TabStatus activeTab={activeTab} />
      <div className="flex gap-2">
        <Button className="flex-1" onClick={() => void browser.runtime.openOptionsPage()}>
          <SettingsIcon />
          Open options
        </Button>
        {/* Firefox opens the sidebar from its own sidebar menu. */}
        {!import.meta.env.FIREFOX && (
          <Button
            className="flex-1"
            variant="outline"
            disabled={windowId === undefined}
            // `sidePanel.open` needs the click's user gesture, so it must be the first await.
            onClick={() => void browser.sidePanel.open({ windowId: windowId! }).then(() => window.close())}
          >
            <PanelRightIcon />
            Open side panel
          </Button>
        )}
      </div>
    </main>
  );
}
