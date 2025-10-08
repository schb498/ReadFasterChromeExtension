chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed!");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.text) {
    console.log("Received selected text:", message.text);
  }
});

// Helper function to update badge for a tab
const updateBadge = (tabId) => {
  chrome.storage.local.get([tabId.toString()], (result) => {
    const isBolded = result[tabId.toString()] || false;
    chrome.action.setBadgeText({
      text: isBolded ? "ON" : "",
      tabId: tabId,
    });
    chrome.action.setBadgeBackgroundColor({
      color: isBolded ? "#667eea" : "#00000000", // Transparent when off
      tabId: tabId,
    });
  });
};

// Update badge when switching tabs
chrome.tabs.onActivated.addListener((activeInfo) => {
  updateBadge(activeInfo.tabId);
});

// Update badge when tab is updated (e.g., navigation)
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "complete") {
    updateBadge(tabId);
  }
});

// Clear state when tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.storage.local.remove([tabId.toString()]);
});

// Clear all states when the extension is reloaded or updated
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.clear();
});
