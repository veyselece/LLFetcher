(() => {
  "use strict";
  try {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs && tabs[0];
      if (!tab || !Number.isInteger(tab.id) || !/^https:\/\/www\.linkedin\.com\/learning\//i.test(tab.url || "")) return;
      chrome.tabs.sendMessage(tab.id, { name: "ui.togglePanel", data: { visible: true } }, () => {
        // Missing receivers are expected on restricted pages or before a tab reload.
        void chrome.runtime.lastError;
      });
    });
  } catch (_) { /* The regular popup remains usable even when the page cannot be messaged. */ }
})();
