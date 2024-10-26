chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed!");

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    console.log(tabs[0]);
  });
});
