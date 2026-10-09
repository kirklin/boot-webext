import type { TabInfo } from "~/lib/messaging";
import { useStorageItem } from "~/hooks/use-storage-item";
import { storageDemo } from "~/lib/storage";

interface TabStatusProps {
  activeTab: TabInfo | undefined;
}

export function TabStatus({ activeTab }: TabStatusProps) {
  const [storageValue] = useStorageItem(storageDemo);

  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
      <dt className="text-muted-foreground">Active tab</dt>
      <dd className="truncate" data-testid="active-tab">{activeTab?.title ?? "-"}</dd>
      <dt className="text-muted-foreground">Storage</dt>
      <dd className="truncate" data-testid="storage-value">{storageValue}</dd>
    </dl>
  );
}
