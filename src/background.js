chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed!");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.text) {
    console.log("Received selected text:", message.text);
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
