import "regenerator-runtime/runtime";
import { RGBToHex, formatColor, getCurrentTab, getColorObject } from "./helper";

import "./popup.css";

document.addEventListener("DOMContentLoaded", function () {
  // Populate the list.
  chrome.storage.sync.get(["savedColors", "colorFormat"], function ({
    savedColors,
    colorFormat,
  }) {
    const pickedColorsList = document.querySelector("#picked-colors-list");
    savedColors.reverse().forEach((savedColor) => {
      const li = document.createElement("li");
      li.dataset.savedColor = savedColor;

      const div = document.createElement("div");
      div.classList.add("color-block");
      div.style.backgroundColor = `rgba(${savedColor})`;
      li.appendChild(div);

      const span = document.createElement("span");
      span.classList.add("color-value");
      span.textContent = formatColor({
        ...getColorObject(savedColor),
        format: colorFormat,
      });
      li.appendChild(span);

      li.addEventListener("click", async (event) => {
        try {
          const activeTab = await getCurrentTab();
          const color = getColorObject(li.dataset.savedColor);
          chrome.tabs.sendMessage(activeTab.id, {
            cmd: "copy",
            color,
          });
        } catch (error) {
          console.error(error);
        }
        window.close(); // Close the popup
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
