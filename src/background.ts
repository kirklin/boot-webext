import { log, error } from "./core/util";

chrome?.runtime?.onInstalled?.addListener(() => {
  log("installed");
  chrome.storage.sync.set({ history: null, parsed: false }, () => {});
});

chrome?.runtime?.onMessage?.addListener(function (message, sender, reply) {
  switch (message.action) {
    case "log":
      log(message.message);
      break;
    default:
      error("unhandled message type");
      error(message.message);
  }
});
