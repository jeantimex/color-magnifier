(function () {
  function start(dataUri) {
    console.log(dataUri);
  }

  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.cmd === 'start') {
       start(request.dataUri);
      }
    }
  );
})();
