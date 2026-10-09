import { SettingsIcon } from "lucide-react";
import { browser } from "#imports";
import { PageHeader } from "~/components/page-header";
import { TabStatus } from "~/components/tab-status";
import { Button } from "~/components/ui/button";
import { useActiveTab } from "~/hooks/use-active-tab";

export default function App() {
  const activeTab = useActiveTab();

  return (
    <main className="flex flex-col gap-4 p-4">
      <PageHeader title="Side panel" context="side panel" />
      <TabStatus activeTab={activeTab} />
      <Button onClick={() => void browser.runtime.openOptionsPage()}>
        <SettingsIcon />
        Open options
      </Button>
    </main>
  );
}
