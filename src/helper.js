const COLOR_FORMAT_RGB = 0;
const COLOR_FORMAT_RGB_HEX = 1;

const allColorFormats = [COLOR_FORMAT_RGB, COLOR_FORMAT_RGB_HEX];

function RGBToHex(r, g, b) {
  r = parseInt(r).toString(16);
  g = parseInt(g).toString(16);
  b = parseInt(b).toString(16);

  if (r.length == 1) r = "0" + r;
  if (g.length == 1) g = "0" + g;
  if (b.length == 1) b = "0" + b;

  return (r + g + b).toUpperCase();
}

function RGBAToHexA(r, g, b, a) {
  r = parseInt(r).toString(16);
  g = parseInt(g).toString(16);
  b = parseInt(b).toString(16);
  a = Math.round(parseInt(a) * 255).toString(16);

  if (r.length == 1) r = "0" + r;
  if (g.length == 1) g = "0" + g;
  if (b.length == 1) b = "0" + b;
  if (a.length == 1) a = "0" + a;

  return (r + g + b + a).toUpperCase();
}

// https://awik.io/determine-color-bright-dark-using-javascript/
function lightOrDark(color) {
  // Variables for red, green, blue values
  let r, g, b, hsp;
  // Check the format of the color, HEX or RGB?
  if (color.match(/^rgb/)) {
    // If RGB --> store the red, green, blue values in separate variables
    color = color.match(
      /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/
    );

    r = color[1];
    g = color[2];
    b = color[3];
  } else {
    // If RGB --> Convert it to HEX: http://gist.github.com/983661
    color = +("0x" + color.slice(1).replace(color.length < 5 && /./g, "$&$&"));

    r = color >> 16;
    g = (color >> 8) & 255;
    b = color & 255;
  }

  // HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
  hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));

  // Using the HSP value, determine whether the color is light or dark
  return hsp > 160 ? "light" : "dark";
}

function blink(element, callback) {
  setTimeout(function () {
    element.style.opacity = element.style.opacity === "0" ? "1" : "0";
  }, 50);

  setTimeout(function () {
    element.style.opacity = element.style.opacity === "0" ? "1" : "0";
  }, 100);

  setTimeout(function () {
    element.style.opacity = element.style.opacity === "0" ? "1" : "0";
  }, 150);

  setTimeout(function () {
    element.style.opacity = element.style.opacity === "0" ? "1" : "0";
    if (callback) {
      callback();
    }
  }, 200);
}

function getStorageData(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(key, (result) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(result[key]);
      }
    });
  });
}

function setStorageData(data) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set(data, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve();
      }
    });
  });
}

function getColorFormatName(format) {
  switch (format) {
    case COLOR_FORMAT_RGB:
      return 'RGB';
    case COLOR_FORMAT_RGB_HEX:
      return 'Hex';
    default:
      return '';
  }
}

function formatColor({red, green, blue, alpha, format, delimiter = ' '}) {
  switch (format) {
    case COLOR_FORMAT_RGB:
      return red + delimiter + green + delimiter + blue;
    case COLOR_FORMAT_RGB_HEX:
      let r = parseInt(red).toString(16).toUpperCase();
      let g = parseInt(green).toString(16).toUpperCase();
      let b = parseInt(blue).toString(16).toUpperCase();

      if (r.length === 1) {
        r = '0' + r;
      }
      if (g.length === 1) {
        g = '0' + g;
      }
      if (b.length === 1) {
        b = '0' + b;
      }

      return r + delimiter + g + delimiter + b;
    default:
      return '';
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export {
  RGBToHex,
  RGBAToHexA,
  lightOrDark,
  blink,
  getStorageData,
  setStorageData,
  getColorFormatName,
  formatColor,
  allColorFormats,
  delay,
};
