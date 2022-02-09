import { log } from "./core/util";

chrome.runtime.onMessage?.addListener((req, sender, sendResponse) => {
  switch (req) {
    case "test":
      log("test from content.ts");
      sendResponse(true);
      break;
    default:
  }
});
