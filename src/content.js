import {RGBToHex, lightOrDark, blink} from './helper';

const fontsPath = chrome.extension.getURL('fonts');

const openSansFont = new FontFace('OpenSans', 'url(' + fontsPath + '/OpenSans-Regular.ttf)');
openSansFont.load()
  .then((fontFace) => {
    document.fonts.add(fontFace);
    document.body.style.fontFamily = '"OpenSans", Arial';
  })
  .catch((error) => {
    // error occurred
    console.error(error);
  });

const gridColor = '#EEE';
const containerBorder = 6;
const count = 25;
const magnifierInfoWidth = 80;
const magnifierInfoHeight = 36;

let flipMagnifierInfo = false;

// Caches the screenshot image data.
let imageData = null;
let magnifierContainer = null;
let magnifierElement = null;
let magnifierGrid = null;
let magnifierInfo = null;
let infoTitle = null;
let infoValue = null;
let notification = null;

let boxSize = 4; // 4px

let centerX = 0;
let centerY = 0;

function createNotification() {
  notification = document.createElement('div');
  notification.style.height = 20 + 'px';
  notification.color = '#333';
  notification.style.padding = '4px 10px';
  notification.style.display = 'flex';
  notification.style.opacity = '0';
  notification.style.alignItems = 'center';
  notification.style.position = 'fixed';
  notification.style.zIndex = 999999;
  notification.style.top = '0px';
  notification.style.left = '50%';
  notification.style.transform = 'translate(-50%, 0)';
  notification.style.borderRadius = '3px';
  notification.style.boxShadow = '0px 0px 1px 1px #999';
  notification.style.transition = 'opacity 0.2s, top 0.2s';
  notification.style.backgroundColor = '#FFF';
  notification.style.fontFamily = 'OpenSans';
  notification.style.fontSize = '12px';

  const colorBlock = document.createElement('div');
  colorBlock.style.width = '13px';
  colorBlock.style.height = '13px';
  colorBlock.style.marginRight = '8px';
  notification.appendChild(colorBlock);

  const colorValue = document.createElement('p');
  notification.appendChild(colorValue);

  document.body.appendChild(notification);
}

function createMagnifier() {
  // Create the container.
  magnifierContainer = document.createElement('div');
  magnifierContainer.style.position = 'absolute';
  magnifierContainer.style.display = 'none';
  magnifierContainer.style.zIndex = 999999;
  magnifierContainer.style.width = boxSize * count + 'px';
  magnifierContainer.style.height = boxSize * count + 'px';

  // Create the magnifier.
  magnifierElement = document.createElement('div');
  magnifierElement.style.position = 'absolute';
  magnifierElement.style.borderRadius = '50%';
  magnifierElement.style.border = 'solid #666 0px';
  magnifierElement.style.overflow = 'hidden';
  magnifierElement.style.backgroundColor = '#999';
  magnifierElement.style.cursor = 'none';
  magnifierElement.style.borderStyle = 'solid';
  magnifierElement.style.borderWidth = containerBorder + 'px';
  magnifierElement.style.boxSizing = 'content-box';
  magnifierElement.style.borderColor = 'rgba(0, 0, 0, 0.2)';
  magnifierElement.style.backgroundClip = 'content-box';
  magnifierElement.style.margin = '0px';
  magnifierElement.style.padding = '0px';
  magnifierElement.style.opacity = '1';

  magnifierElement.style.width = boxSize * count + 'px';
  magnifierElement.style.height = boxSize * count + 'px';
  createMagnifierColorBoxes();

  // Magnifier grid
  magnifierGrid = document.createElement('div');
  magnifierGrid.style.position = 'absolute';
  magnifierGrid.style.width = boxSize * count + 'px';
  magnifierGrid.style.height = boxSize * count + 'px';
  magnifierGrid.style.cursor = 'none';
  magnifierGrid.style.borderRadius = '50%';
  magnifierGrid.style.border = 'solid #666 2px';
  magnifierGrid.style.boxSizing = 'border-box';
  magnifierGrid.style.backgroundColor = 'transparent';
  magnifierGrid.style.backgroundPosition = '0,0,0,0';
  magnifierGrid.style.backgroundImage = 
    'repeating-linear-gradient(to right, ' + gridColor + ' 0, ' + gridColor + ' 1px, transparent 1px, transparent ' + boxSize + 'px),' +
    'repeating-linear-gradient(to bottom, ' + gridColor + ' 0, ' + gridColor + ' 1px, transparent 1px, transparent ' + boxSize + 'px)';

  // info
  magnifierInfo = document.createElement('div');
  magnifierInfo.style.position = 'absolute';
  magnifierInfo.style.boxSizing = 'border-box';
  magnifierInfo.style.display = 'flex';
  magnifierInfo.style.flexDirection = 'column';
  magnifierInfo.style.justifyContent = 'space-between';
  magnifierInfo.style.padding = '5px';
  magnifierInfo.style.fontSize = '10px';
  magnifierInfo.style.width = magnifierInfoWidth + 'px';
  magnifierInfo.style.height = magnifierInfoHeight + 'px';
  magnifierInfo.style.backgroundColor = '#474f59';
  magnifierInfo.style.top = (count * boxSize + 2 * containerBorder - magnifierInfoHeight) / 2 + 'px';
  magnifierInfo.style.left = (count + 1) / 2 * boxSize + 20 + 'px';
  magnifierInfo.style.boxShadow = '0 0 3px 1px #666';

  infoTitle = document.createElement('p');
  infoTitle.style.padding = '0px';
  infoTitle.style.margin = '0px';
  infoTitle.textContent = 'Display Hex';
  infoTitle.style.fontSize = '11px';
  infoTitle.style.lineHeight = '12px';
  infoTitle.style.fontFamily = 'OpenSans';
  magnifierInfo.appendChild(infoTitle);

  infoValue = document.createElement('p');
  infoValue.style.padding = '0px';
  infoValue.style.margin = '0px';
  infoValue.id = 'color-info-value';
  infoValue.style.fontSize = '11px';
  infoValue.style.lineHeight = '12px';
  infoValue.style.fontFamily = 'OpenSans';
  magnifierInfo.appendChild(infoValue);

  magnifierContainer.appendChild(magnifierElement);
  // magnifierContainer.appendChild(magnifierGrid);
  magnifierContainer.appendChild(magnifierInfo);
  document.body.appendChild(magnifierContainer);
}

function createMagnifierColorBoxes() {
  magnifierElement.innerHTML = '';

  // Create the color boxes inside the magnifier.
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < count * count; i++) {
    const colorBox = document.createElement('div');
    colorBox.id = 'color-box-' + i;
    colorBox.style.position = 'absolute';
    colorBox.style.top = parseInt(i / count) * boxSize + 'px';
    colorBox.style.left = (i % count) * boxSize + 'px';
    colorBox.style.width = boxSize + 'px';
    colorBox.style.height = boxSize + 'px';
    colorBox.style.boxSizing = 'content-box';
    colorBox.style.backgroundColor = 'red';
    colorBox.style.border = '1px solid #EEE';

    if (i === parseInt((count * count) / 2)) {
      colorBox.style.boxSizing = 'border-box';
      colorBox.style.border = '1px solid #FFF';
      colorBox.style.width = boxSize + 1 + 'px';
      colorBox.style.height = boxSize + 1 + 'px';
      
      colorBox.style.zIndex = 999999;
    }
    fragment.appendChild(colorBox);
  }
  magnifierElement.appendChild(fragment);
}

/**
 * 
 */
function removeMagnifier() {
  if (magnifierContainer) {
    magnifierContainer.remove();
  }
  magnifierContainer = null;
  magnifierElement = null;
  infoValue = null;
}

/**
 * @param {string} dataUri The captured image data URI 
 */
function updateImageData(dataUri) {
  const WIDTH = window.innerWidth;
  const HEIGHT = window.innerHeight;

  const img = new Image();
  img.width = WIDTH;
  img.height = HEIGHT;

  img.onload = function() {
    const canvas = document.createElement('canvas');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    canvas.style.position = 'absolute';

    const context = canvas.getContext('2d');
    // Assuming px,py as starting coordinates and hx,hy be the width and the height of the image to be extracted
    context.imageSmoothingEnabled = false;
    context.globalCompositeOperation = 'copy';
    context.drawImage(img, 0, 0, WIDTH, HEIGHT);

    imageData = context.getImageData(0, 0, WIDTH, HEIGHT);
    //var croppedUri = canvas.toDataURL('image/png');
    // You could deal with croppedUri as cropped image src.

    removeMagnifier();
    createMagnifier();

    // Now it's ready to pick color using magnifier.
    document.removeEventListener('mousemove', handleMouseMove, false);
    document.addEventListener('mousemove', handleMouseMove, false);

    document.removeEventListener('mousedown', saveData, false);
    document.addEventListener('mousedown', saveData, false);

    document.removeEventListener('keydown', handleKeydown, false);
    document.addEventListener('keydown', handleKeydown, false);
  };

  img.src = dataUri;
  img.style.position = 'absolute';
}

function handleMouseMove(event) {
  event.stopPropagation();
  event.stopImmediatePropagation();

  centerX = event.clientX;
  centerY = event.clientY;

  updateMagnifier(centerX, centerY);
}

function updateMagnifier(centerX, centerY) {
  if (!imageData) {
    return;
  }

  // locate index of current pixel
  const centerIdx = (centerY * imageData.width + centerX) * 4;

  let red = imageData.data[centerIdx];
  let green = imageData.data[centerIdx + 1];
  let blue = imageData.data[centerIdx + 2];
  let alpha = imageData.data[centerIdx + 3];
  // Output
  //console.log('pix x ' + x +' y '+y+ ' index '+index +' COLOR '+red+','+green+','+blue+','+alpha);

  magnifierContainer.style.display = '';
  magnifierContainer.style.left = centerX - (containerBorder + count * boxSize / 2) + 'px';
  magnifierContainer.style.top = centerY - (containerBorder + count * boxSize / 2) + 'px';

  flipMagnifierInfo = parseInt(magnifierContainer.style.left) + ((count + 1) / 2 * boxSize + 20) + magnifierInfoWidth + 10 > window.innerWidth;

  if (flipMagnifierInfo) {
    magnifierInfo.style.left = containerBorder + parseInt(count / 2) * boxSize - 20 - magnifierInfoWidth + 'px';
  } else {
    magnifierInfo.style.left = containerBorder + (parseInt(count / 2) + 1) * boxSize + 20 + 'px';
  }

  const startX = centerX - parseInt(count / 2);
  const startY = centerY - parseInt(count / 2);
  for (let i = 0; i < count * count; i++) {
    const x = startX + (i % count);
    const y = startY + parseInt(i / count);
    //console.log(x, y);

    const colorBox = magnifierElement.querySelector('#color-box-' + i);
    
    const index = (y * imageData.width + x) * 4;
    //console.log(index);

    if (index >= 0 && index + 3 < imageData.data.length) {
      red = imageData.data[index];
      green = imageData.data[index + 1];
      blue = imageData.data[index + 2];
      alpha = imageData.data[index + 3];
      //console.log(red, green, blue, alpha);
    } else {
      red = 255;
      green = 255;
      blue = 255;
      alpha = 1;
    }
    colorBox.style.backgroundColor = `rgba(${red},${green},${blue},${alpha})`;

    const hex = '#' + RGBToHex(red, green, blue, alpha);
    colorBox.style.borderColor = lightOrDark(hex) === 'light' ? 'rgba(200,200,200,0.3)' : 'rgba(0,0,0,0.15)';

    if (i === parseInt(count * count / 2)) {
      if (lightOrDark(hex) === 'light') {
        colorBox.style.borderColor = '#666';
        infoTitle.style.color = '#666';
        infoValue.style.color = '#666';
      } else {
        colorBox.style.borderColor = '#FFF';
        infoTitle.style.color = '#FFF';
        infoValue.style.color = '#FFF';
      }

      let r = red.toString(16).toUpperCase();
      let g = green.toString(16).toUpperCase();
      let b = blue.toString(16).toUpperCase();

      if (r.length === 1) {
        r = '0' + r;
      }
      if (g.length === 1) {
        g = '0' + g;
      }
      if (b.length === 1) {
        b = '0' + b;
      }

      magnifierInfo.style.backgroundColor = hex;
      infoValue.textContent = r + ' ' + g + ' ' + b;
    }
  }
}

function handleKeydown(event) {
  event.stopPropagation();
  event.stopImmediatePropagation();

  if (event.key === 'Escape') {
    quit();
  } else if (event.key === '[') {
    shrink();
  } else if (event.key === ']') {
    enlarge();
  }
}

function shrink() {
  if (boxSize <= 4) {
    return;
  }

  boxSize--;

  magnifierContainer.style.width = boxSize * count + 'px';
  magnifierContainer.style.height = boxSize * count + 'px';

  magnifierElement.style.width = boxSize * count + 'px';
  magnifierElement.style.height = boxSize * count + 'px';

  magnifierGrid.style.width = boxSize * count + 'px';
  magnifierGrid.style.height = boxSize * count + 'px';
  magnifierGrid.style.backgroundImage = 
    'repeating-linear-gradient(to right, ' + gridColor + ' 0, ' + gridColor + ' 1px, transparent 1px, transparent ' + boxSize + 'px),' +
    'repeating-linear-gradient(to bottom, ' + gridColor + ' 0, ' + gridColor + ' 1px, transparent 1px, transparent ' + boxSize + 'px)';

  magnifierInfo.style.top = (count * boxSize + 2 * containerBorder - magnifierInfoHeight) / 2 + 'px';
  if (flipMagnifierInfo) {
    magnifierInfo.style.left = containerBorder + parseInt(count / 2) * boxSize - 20 - magnifierInfoWidth + 'px';
  } else {
    magnifierInfo.style.left = containerBorder + (parseInt(count / 2) + 1) * boxSize + 20 + 'px';
  }

  createMagnifierColorBoxes();

  updateMagnifier(centerX, centerY);
}

function enlarge() {
  if (boxSize >= 25) {
    return;
  }

  boxSize++;

  magnifierContainer.style.width = boxSize * count + 'px';
  magnifierContainer.style.height = boxSize * count + 'px';

  magnifierElement.style.width = boxSize * count + 'px';
  magnifierElement.style.height = boxSize * count + 'px';

  magnifierGrid.style.width = boxSize * count + 'px';
  magnifierGrid.style.height = boxSize * count + 'px';
  magnifierGrid.style.backgroundImage = 
    'repeating-linear-gradient(to right, ' + gridColor + ' 0, ' + gridColor + ' 1px, transparent 1px, transparent ' + boxSize + 'px),' +
    'repeating-linear-gradient(to bottom, ' + gridColor + ' 0, ' + gridColor + ' 1px, transparent 1px, transparent ' + boxSize + 'px)';

  magnifierInfo.style.top = (count * boxSize + 2 * containerBorder - magnifierInfoHeight) / 2 + 'px';
  if (flipMagnifierInfo) {
    magnifierInfo.style.left = (count + 1) / 2 * boxSize - magnifierInfoWidth - containerBorder + 'px';
  } else {
    magnifierInfo.style.left = containerBorder + (parseInt(count / 2) + 1) * boxSize + 20 + 'px';
  }

  createMagnifierColorBoxes();

  updateMagnifier(centerX, centerY);
}

function showNotification(red, green, blue, alpha) {
  const colorBlock = notification.querySelector('div');
  colorBlock.style.backgroundColor = `rgba(${red},${green},${blue},${alpha})`;

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

  const colorValue = notification.querySelector('p');
  colorValue.innerHTML = '<span style="font-weight:bold;">' +
    r + g + b + '</span> Copied';

  notification.style.opacity = '1';
  notification.style.top = '10px';

  setTimeout(function () {
    notification.style.opacity = '0';
    notification.style.top = '0px';
  }, 2000);
}

function quit() {
  imageData = null;
  removeMagnifier();

  document.removeEventListener('mousemove', updateMagnifier);
  document.removeEventListener('keydown', handleKeydown);
}

/**
 * @param {Event} event 
 */
function saveData(event) {
  event.stopPropagation();

  if (!imageData) {
    return;
  }

  const x = event.clientX;
  const y = event.clientY;
  // locate index of current pixel
  const centerIdx = (y * imageData.width + x) * 4;

  const red = imageData.data[centerIdx];
  const green = imageData.data[centerIdx + 1];
  const blue = imageData.data[centerIdx + 2];
  const alpha = imageData.data[centerIdx + 3];

  chrome.storage.sync.get(['savedColors'], function ({savedColors}) {
    const color = `${red},${green},${blue},${alpha}`;
    if (!savedColors.includes(color)) {
      savedColors.push(color);
      chrome.storage.sync.set({savedColors}, function () {
        //console.log(savedColors);
        const [red, green, blue, alpha] = color.split(',');
        const hex = RGBToHex(red, green, blue);

        navigator.clipboard.writeText(hex).then(() => {
          blink(magnifierElement, () => {
            showNotification(red, green, blue, alpha);
            quit();
          });
        }, (error) => {
          quit();
        });
      });
    }
  });
}

createNotification();

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.cmd === 'start') {
      updateImageData(request.dataUri);
      window.addEventListener('resize', quit);
    } else if (request.cmd === 'copy') {
      const [red, green, blue, alpha] = request.savedColor.split(',');
      showNotification(red, green, blue, alpha);
    } else if (request.cmd === 'quit') {
      window.removeEventListener('resize', quit);
      quit();
    }
  }
);
