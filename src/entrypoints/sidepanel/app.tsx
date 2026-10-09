import { SettingsIcon } from "lucide-react";
import { browser } from "#imports";
import { PageHeader } from "~/components/page-header";
import { TabStatus } from "~/components/tab-status";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { useActiveTab } from "~/hooks/use-active-tab";
import { useStorageItem } from "~/hooks/use-storage-item";
import { useTabActivity } from "~/hooks/use-tab-activity";
import { selectedText } from "~/lib/selected-text";

export default function App() {
  const activeTab = useActiveTab();
  const [selection] = useStorageItem(selectedText);
  const activity = useTabActivity();

  return (
    <main className="flex flex-col gap-4 p-4">
      <PageHeader title="Side panel" context="side panel" />
      <TabStatus activeTab={activeTab} />
      <Button onClick={() => void browser.runtime.openOptionsPage()}>
        <SettingsIcon />
        Open options
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Selected text</CardTitle>
          <CardDescription>Select text on a page, right-click it and choose "Send to the side panel".</CardDescription>
        </CardHeader>
        <CardContent data-testid="selected-text">
          {selection
            ? (
                <figure className="flex flex-col gap-1 text-sm">
                  <blockquote className="border-l-2 pl-3 whitespace-pre-wrap">{selection.text}</blockquote>
                  <figcaption className="truncate text-muted-foreground">{selection.pageTitle ?? selection.pageUrl}</figcaption>
                </figure>
              )
            : <p className="text-sm text-muted-foreground">Nothing sent yet.</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Tab activity
            <Badge variant={activity.connected ? "secondary" : "outline"} data-testid="activity-status">
              {activity.connected ? "Live" : "Reconnecting"}
            </Badge>
          </CardTitle>
          <CardDescription>
            {activity.reconnects === 0
              ? "Streamed from the background over a port."
              : `Streamed from the background over a port, reconnected ${activity.reconnects} ${activity.reconnects === 1 ? "time" : "times"}.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activity.events.length === 0
            ? <p className="text-sm text-muted-foreground">Open, switch or close a tab.</p>
            : (
                <ol className="flex flex-col gap-1 text-sm" data-testid="activity">
                  {activity.events.map(event => (
                    <li key={`${event.time}-${event.kind}-${event.tabId}`} className="flex gap-2">
                      <span className="shrink-0 text-muted-foreground tabular-nums">{new Date(event.time).toLocaleTimeString()}</span>
                      <span className="shrink-0 font-medium">{event.kind}</span>
                      <span className="truncate">{event.title ?? `Tab ${event.tabId}`}</span>
                    </li>
                  ))}
                </ol>
              )}
        </CardContent>
      </Card>
    </main>
  );
}
