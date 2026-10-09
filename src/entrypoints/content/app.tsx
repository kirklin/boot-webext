import { PuzzleIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "~/components/ui/popover";
import { PortalContainerContext } from "~/hooks/use-portal-container";
import { useStorageItem } from "~/hooks/use-storage-item";
import { onMessage } from "~/lib/messaging";
import { storageDemo } from "~/lib/storage";

export default function App() {
  const [storageValue] = useStorageItem(storageDemo);
  const [previousTitle, setPreviousTitle] = useState<string>();
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);

  useEffect(() => onMessage("tabActivated", ({ data }) => {
    // eslint-disable-next-line no-console
    console.log(`[boot-webext] Navigate from page "${data.title}"`);
    setPreviousTitle(data.title);
  }), []);

  return (
    <PortalContainerContext value={portalContainer}>
      <div className="fixed right-5 bottom-5 z-2147483647 font-sans">
        <Popover>
          <PopoverTrigger asChild>
            <Button size="icon-lg" className="rounded-full shadow-lg" aria-label="Boot WebExt">
              <PuzzleIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent side="top" align="end" className="w-72">
            <PopoverHeader>
              <PopoverTitle>Boot WebExt</PopoverTitle>
              <PopoverDescription>This is the content script page.</PopoverDescription>
            </PopoverHeader>
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
              <dt className="text-muted-foreground">Storage</dt>
              <dd className="truncate" data-testid="storage-value">{storageValue}</dd>
              <dt className="text-muted-foreground">From tab</dt>
              <dd className="truncate" data-testid="previous-tab">{previousTitle ?? "-"}</dd>
            </dl>
          </PopoverContent>
        </Popover>
        {/* Popover content portals here so it stays inside the shadow root. */}
        <div ref={setPortalContainer} />
      </div>
    </PortalContainerContext>
  );
}
