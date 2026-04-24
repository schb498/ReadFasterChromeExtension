// 1. Initialise global state on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    extensionEnabled: false,
    boldWeight: 700,
    boldMode: "global",
  });
});

// Helper: Syncs badge based on Tab-Specific state
const updateBadge = (tabId) => {
  chrome.storage.local.get([`tab_${tabId}_enabled`], (result) => {
    const isEnabled = result[`tab_${tabId}_enabled`] || false;

    chrome.action.setBadgeText({
      text: isEnabled ? "ON" : "",
      tabId: tabId,
    });

    chrome.action.setBadgeBackgroundColor({
      color: "#667eea",
      tabId: tabId,
    });
  });
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
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

    chrome.storage.local.get([enabledKey, modeKey, "boldWeight"], (result) => {
      if (result[enabledKey] && result[modeKey] === "global") {
        chrome.tabs.sendMessage(tabId, {
          action: "toggleBold",
          isBolded: true,
          boldWeight: result.boldWeight || 700,
        });
      } else if (result[modeKey] === "selection") {
        // Clear state if it was just a selection (selection doesn't persist refresh)
        chrome.storage.local.remove([enabledKey, modeKey]);
      }
      updateBadge(tabId);
    });
  }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  updateBadge(activeInfo.tabId);
});

// Clean up storage when tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.storage.local.remove([`tab_${tabId}_enabled`, `tab_${tabId}_mode`]);
});
