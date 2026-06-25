// Defaults are inlined (not imported from boldText) so this service worker
// stays out of the popup's module graph and the build emits no shared chunk.
const BOLD_WEIGHT_DEFAULT = 700;
const DIM_LEVEL_DEFAULT = 1;

// Ignore "Could not establish connection" errors when a tab has no content
// script (e.g. chrome:// pages, the Web Store, PDFs).
const ignoreLastError = (): void => void chrome.runtime.lastError;

// 1. Initialise global preferences on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    boldWeight: BOLD_WEIGHT_DEFAULT,
    dimLevel: DIM_LEVEL_DEFAULT,
  });
});

// Helper: Syncs badge based on tab-specific state
const updateBadge = (tabId: number): void => {
  chrome.storage.local.get([`tab_${tabId}_enabled`], (result) => {
    const isEnabled = result[`tab_${tabId}_enabled`] || false;

    chrome.action.setBadgeText({ text: isEnabled ? "ON" : "", tabId });
    chrome.action.setBadgeBackgroundColor({ color: "#667eea", tabId });
  });
};

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "syncBadge") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) updateBadge(tabs[0].id);
    });
  }
  return true;
});

// Auto-toggle bolding ONLY for the refreshed tab if it was globally enabled
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "complete") {
    const enabledKey = `tab_${tabId}_enabled`;
    const modeKey = `tab_${tabId}_mode`;

    chrome.storage.local.get(
      [enabledKey, modeKey, "boldWeight", "dimLevel"],
      (result) => {
        if (result[enabledKey] && result[modeKey] === "global") {
          chrome.tabs.sendMessage(
            tabId,
            {
              action: "toggleBold",
              isBolded: true,
              boldWeight: result.boldWeight ?? BOLD_WEIGHT_DEFAULT,
              dimLevel: result.dimLevel ?? DIM_LEVEL_DEFAULT,
            },
            ignoreLastError,
          );
        } else if (result[modeKey] === "selection") {
          // Clear state if it was just a selection (doesn't persist refresh)
          chrome.storage.local.remove([enabledKey, modeKey]);
        }
        updateBadge(tabId);
      },
    );
  }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  updateBadge(activeInfo.tabId);
});

// Clean up storage when tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.storage.local.remove([`tab_${tabId}_enabled`, `tab_${tabId}_mode`]);
});
