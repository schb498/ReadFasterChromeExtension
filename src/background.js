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
