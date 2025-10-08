chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed!");

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    console.log(tabs[0]);
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.text) {
    console.log("Received selected text:", message.text);
  }
});

// Background script to manage bold state per tab
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "setBoldState" && sender.tab?.id) {
    chrome.storage.local.set({ [sender.tab.id.toString()]: message.isBolded });
  } else if (message.action === "getBoldState" && sender.tab?.id) {
    chrome.storage.local.get([sender.tab.id.toString()], (result) => {
      sendResponse(result[sender.tab.id.toString()] || false);
    });
    return true; // keep the message channel open for async response
  }
});

// Clear state when tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  delete boldStates[tabId];
});
