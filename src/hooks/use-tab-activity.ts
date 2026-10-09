import type { Browser } from "#imports";
import type { TabActivity } from "~/lib/tab-activity";
import { useEffect, useState } from "react";
import { browser } from "#imports";
import { TAB_ACTIVITY_PORT } from "~/lib/tab-activity";

const RECONNECT_DELAY = 1000;

/**
 * Receives tab activity from the background over a long-lived port. The browser stops
 * an idle MV3 service worker, which closes the port, so the hook connects again and the
 * new connection starts the service worker back up.
 */
export function useTabActivity(limit = 20) {
  const [events, setEvents] = useState<TabActivity[]>([]);
  // `runtime.connect` opens the port right away; only losing it is reported later.
  const [connected, setConnected] = useState(true);
  const [reconnects, setReconnects] = useState(0);

  useEffect(() => {
    let port: Browser.runtime.Port | undefined;
    let retry: ReturnType<typeof setTimeout> | undefined;
    let disposed = false;

    const connect = () => {
      port = browser.runtime.connect({ name: TAB_ACTIVITY_PORT });
      port.onMessage.addListener((activity: TabActivity) => {
        setEvents(previous => [activity, ...previous].slice(0, limit));
      });
      port.onDisconnect.addListener(() => {
        setConnected(false);
        if (!disposed) {
          retry = setTimeout(() => {
            setReconnects(count => count + 1);
            setConnected(true);
            connect();
          }, RECONNECT_DELAY);
        }
      });
    };

    connect();
    return () => {
      disposed = true;
      clearTimeout(retry);
      port?.disconnect();
    };
  }, [limit]);

  return { events, connected, reconnects };
}
