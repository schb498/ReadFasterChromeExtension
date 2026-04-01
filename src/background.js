// 1. Initialise global state on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    extensionEnabled: false,
    boldWeight: 700,
    boldMode: "global",
  });
});

// 2. Updated Helper: Syncs badge based on Mode and Enabled state
const updateBadge = (tabId) => {
  chrome.storage.local.get(["extensionEnabled", "boldMode"], (result) => {
    const isEnabled = result.extensionEnabled || false;
    const mode = result.boldMode || "global";

    // Show badge if extension is ON.
    // Content script handles turning isEnabled to false on refresh if mode was 'selection'.
    const shouldShowOn = isEnabled;

    chrome.action.setBadgeText({
      text: shouldShowOn ? "ON" : "",
      tabId: tabId,
    });

    chrome.action.setBadgeBackgroundColor({
      color: "#667eea",
      tabId: tabId,
    });
  });
};

// 3. Centralised Message Listener (MERGED)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "syncBadge") {
    // Determine the Tab ID: Use sender if from content script, query active if from popup
    const tabId = sender.tab ? sender.tab.id : null;

    if (tabId) {
      updateBadge(tabId);
    } else {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) updateBadge(tabs[0].id);
      });
    }
  }

  // Log selected text from content script
  if (message.text) {
    console.log("Received selected text:", message.text);
  }

  return true; // Keep channel open for async
});

// 4. Update badge when switching tabs
chrome.tabs.onActivated.addListener((activeInfo) => {
  updateBadge(activeInfo.tabId);
});

// 5. Update badge when tab is updated (navigation/refresh)
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "complete") {
    updateBadge(tabId);
  }
});
