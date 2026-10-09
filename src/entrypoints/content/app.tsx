import { PuzzleIcon, SettingsIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "~/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { PortalContainerContext } from "~/hooks/use-portal-container";
import { useStorageItem } from "~/hooks/use-storage-item";
import { onMessage } from "~/lib/messaging";
import { storageDemo } from "~/lib/storage";
import { usePageRequests } from "./page-requests";
import { SettingsDialog } from "./settings-dialog";

export default function App() {
  const [storageValue] = useStorageItem(storageDemo);
  const pageRequests = usePageRequests();
  const [previousTitle, setPreviousTitle] = useState<string>();
  const [panelOpen, setPanelOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);
  const panelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => onMessage("tabActivated", ({ data }) => {
    // eslint-disable-next-line no-console
    console.log(`[boot-webext] Navigate from page "${data.title}"`);
    setPreviousTitle(data.title);
  }), []);

  // Sent by the background when the keyboard shortcut is pressed.
  useEffect(() => onMessage("togglePanel", () => setPanelOpen(open => !open)), []);

  const openSettings = () => {
    setPanelOpen(false);
    setSettingsOpen(true);
  };

  return (
    <PortalContainerContext value={portalContainer}>
      <TooltipProvider>
        <div className="fixed right-5 bottom-5 z-2147483647 font-sans">
          <Popover open={panelOpen} onOpenChange={setPanelOpen}>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button ref={panelButtonRef} size="icon-lg" className="rounded-full shadow-lg" aria-label="Boot WebExt">
                    <PuzzleIcon />
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent side="left">Boot WebExt</TooltipContent>
            </Tooltip>
            <PopoverContent
              side="top"
              align="end"
              className="w-80"
              onCloseAutoFocus={(event) => {
                // Radix normally returns focus to the button once the panel has closed. When the
                // panel closes to open the settings dialog, that would pull focus out of the dialog,
                // and inside a shadow root the dialog never notices focus leaving.
                if (settingsOpen) {
                  event.preventDefault();
                }
              }}
            >
              <PopoverHeader>
                <PopoverTitle>Boot WebExt</PopoverTitle>
                <PopoverDescription>This is the content script page.</PopoverDescription>
              </PopoverHeader>
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                <dt className="text-muted-foreground">Storage</dt>
                <dd className="truncate" data-testid="storage-value">{storageValue}</dd>
                <dt className="text-muted-foreground">From tab</dt>
                <dd className="truncate" data-testid="previous-tab">{previousTitle ?? "-"}</dd>
                <dt className="text-muted-foreground">Page requests</dt>
                <dd data-testid="page-request-count">{pageRequests.count}</dd>
              </dl>
              {pageRequests.recent.length > 0 && (
                <ul className="flex flex-col gap-1 rounded-md bg-muted p-2 font-mono text-xs" data-testid="page-requests">
                  {pageRequests.recent.map((request, index) => (
                    // The same request can repeat, so the position is part of the key.
                    // eslint-disable-next-line react/no-array-index-key
                    <li key={`${index}-${request.method}-${request.url}`} className="truncate">
                      {`${request.method} ${request.url}`}
                    </li>
                  ))}
                </ul>
              )}
              <Button variant="outline" onClick={openSettings}>
                <SettingsIcon />
                Settings
              </Button>
            </PopoverContent>
          </Popover>
          <SettingsDialog
            open={settingsOpen}
            onOpenChange={setSettingsOpen}
            onCloseAutoFocus={(event) => {
              // The dialog has no trigger of its own, so focus goes back to the panel button.
              event.preventDefault();
              panelButtonRef.current?.focus();
            }}
          />
          {/* Popovers, dialogs, selects and tooltips portal here so they stay inside the shadow root. */}
          <div ref={setPortalContainer} />
        </div>
      </TooltipProvider>
    </PortalContainerContext>
  );
}
