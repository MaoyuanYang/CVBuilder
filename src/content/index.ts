import { createChromeStorageBackend, loadProfile } from "../shared/storage";
import { runAutoFill } from "./fillEngine";

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message && message.type === "autofill") {
    void (async () => {
      try {
        const profile = await loadProfile(createChromeStorageBackend());
        if (!profile) {
          sendResponse({ error: "no-data" });
          return;
        }
        sendResponse(runAutoFill(document, profile));
      } catch {
        sendResponse({ error: "fill-failed" });
      }
    })();
    return true;
  }
  return false;
});
