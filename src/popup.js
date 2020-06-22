import { RGBToHex } from "./helper";

import "./popup.css";

document.addEventListener("DOMContentLoaded", function () {
  // Populate the list.
  chrome.storage.sync.get(["savedColors"], function ({ savedColors }) {
    const pickedColorsList = document.querySelector("#picked-colors-list");
    savedColors.reverse().forEach((savedColor) => {
      const [red, green, blue, alpha] = savedColor.split(",");
      const hex = RGBToHex(red, green, blue);

      const li = document.createElement("li");
      li.dataset.hex = hex;
      li.dataset.savedColor = savedColor;

      const div = document.createElement("div");
      div.classList.add("color-block");
      div.style.backgroundColor = `rgba(${red},${green},${blue},${alpha})`;
      li.appendChild(div);

      const span = document.createElement("span");
      span.classList.add("color-value");
      span.textContent = hex;
      li.appendChild(span);

      li.addEventListener("click", function (event) {
        navigator.clipboard.writeText(li.dataset.hex).then(
          () => {
            chrome.tabs.query({ active: true, currentWindow: true }, function (
              tabs
            ) {
              const activeTab = tabs[0];
              if (activeTab) {
                chrome.tabs.sendMessage(activeTab.id, {
                  cmd: "copy",
                  savedColor: li.dataset.savedColor,
                });
              }
              window.close(); // Close the popup
            });
          },
          (error) => {
            console.error("Color Snapper failed to write to clipboard", error);
            window.close();
          }
        );
      });

      pickedColorsList.appendChild(li);
    });
  });

  // Pick Color button
  const btnPickColor = document.querySelector("#btnPickColor");

  btnPickColor.addEventListener("click", function () {
    chrome.runtime.sendMessage({ cmd: "capture" }, function (response) {
      const dataUri = response.dataUri;

      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const activeTab = tabs[0];
        if (activeTab) {
          chrome.tabs.sendMessage(activeTab.id, { cmd: "start", dataUri });
        }
        window.close(); // Close the popup
      });
    });
  });
});
