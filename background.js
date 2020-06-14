chrome.runtime.onInstalled.addListener(
  function() {
    chrome.storage.sync.set({savedColors: []});
  }
);

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.cmd === 'capture') {
      chrome.tabs.captureVisibleTab(null, {}, function(dataUri) {
        sendResponse({dataUri});
      });
    }
    // Note: Returning true is required here!
    // ref: http://stackoverflow.com/questions/20077487/chrome-extension-message-passing-response-not-sent
    return true; 
  }
);
