document.addEventListener('DOMContentLoaded', function () {
  const btnPickColor = document.querySelector('#btnPickColor');

  btnPickColor.addEventListener('click', function () {
    chrome.runtime.sendMessage({cmd: 'capture'}, function(response) {
      const dataUri = response.dataUri;

      chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        const activeTab = tabs[0];
        if (activeTab) {
          chrome.tabs.sendMessage(activeTab.id, {cmd: 'start', dataUri});
        }
        window.close(); // Close the popup
      });
    });
  });
});
