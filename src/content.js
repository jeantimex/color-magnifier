import {RGBToHex, lightOrDark, blink} from './helper';

const gridColor = '#EEE';
const containerBorder = 6;
const count = 25;

// Caches the screenshot image data.
let imageData = null;
let snapperContainer = null;
let snapperElement = null;
let snapperGrid = null;
let snapperInfo = null;
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

  const colorBlock = document.createElement('div');
  colorBlock.style.width = '13px';
  colorBlock.style.height = '13px';
  colorBlock.style.marginRight = '8px';
  notification.appendChild(colorBlock);

  const colorValue = document.createElement('p');
  notification.appendChild(colorValue);

  document.body.appendChild(notification);
}

function createSnapper() {
  // Create the container.
  snapperContainer = document.createElement('div');
  snapperContainer.style.position = 'absolute';
  snapperContainer.style.display = 'none';
  snapperContainer.style.zIndex = 999999;
  snapperContainer.style.width = boxSize * count + 'px';
  snapperContainer.style.height = boxSize * count + 'px';

  // Create the snapper.
  snapperElement = document.createElement('div');
  snapperElement.id = 'com.jeantimex.crx.color.snapper';
  snapperElement.style.position = 'absolute';
  snapperElement.style.borderRadius = '50%';
  snapperElement.style.border = 'solid #666 0px';
  snapperElement.style.overflow = 'hidden';
  snapperElement.style.backgroundColor = '#999';
  snapperElement.style.cursor = 'none';
  snapperElement.style.borderStyle = 'solid';
  snapperElement.style.borderWidth = containerBorder + 'px';
  snapperElement.style.boxSizing = 'content-box';
  snapperElement.style.borderColor = 'rgba(0, 0, 0, 0.2)';
  snapperElement.style.backgroundClip = 'content-box';
  snapperElement.style.margin = '0px';
  snapperElement.style.padding = '0px';
  snapperElement.style.opacity = '1';

  snapperElement.style.width = boxSize * count + 'px';
  snapperElement.style.height = boxSize * count + 'px';
  createSnapperColorBoxes();

  // Snapper grid
  snapperGrid = document.createElement('div');
  snapperGrid.style.position = 'absolute';
  snapperGrid.style.width = boxSize * count + 'px';
  snapperGrid.style.height = boxSize * count + 'px';
  snapperGrid.style.cursor = 'none';
  snapperGrid.style.borderRadius = '50%';
  snapperGrid.style.border = 'solid #666 2px';
  snapperGrid.style.boxSizing = 'border-box';
  snapperGrid.style.backgroundColor = 'transparent';
  snapperGrid.style.backgroundPosition = '0,0,0,0';
  snapperGrid.style.backgroundImage = 
    'repeating-linear-gradient(to right, ' + gridColor + ' 0, ' + gridColor + ' 1px, transparent 1px, transparent ' + boxSize + 'px),' +
    'repeating-linear-gradient(to bottom, ' + gridColor + ' 0, ' + gridColor + ' 1px, transparent 1px, transparent ' + boxSize + 'px)';

  // info
  snapperInfo = document.createElement('div');
  snapperInfo.style.position = 'absolute';
  snapperInfo.style.boxSizing = 'border-box';
  snapperInfo.style.display = 'flex';
  snapperInfo.style.flexDirection = 'column';
  snapperInfo.style.justifyContent = 'space-between';
  snapperInfo.style.padding = '5px';
  snapperInfo.style.fontSize = '10px';
  snapperInfo.style.width = '78px';
  snapperInfo.style.height = '36px';
  snapperInfo.style.backgroundColor = '#474f59';
  snapperInfo.style.top = (count * boxSize + 2 * containerBorder - 36) / 2 + 'px';
  snapperInfo.style.left = (count + 1) / 2 * boxSize + 20 + 'px';
  snapperInfo.style.boxShadow = '0 0 3px 1px #666';

  infoTitle = document.createElement('p');
  infoTitle.style.padding = '0px';
  infoTitle.style.margin = '0px';
  infoTitle.textContent = 'Display Hex';
  infoTitle.style.fontSize = '11px';
  infoTitle.style.lineHeight = '12px';
  snapperInfo.appendChild(infoTitle);

  infoValue = document.createElement('p');
  infoValue.style.padding = '0px';
  infoValue.style.margin = '0px';
  infoValue.id = 'color-info-value';
  infoValue.style.fontSize = '11px';
  infoValue.style.lineHeight = '12px';
  snapperInfo.appendChild(infoValue);

  snapperContainer.appendChild(snapperElement);
  // snapperContainer.appendChild(snapperGrid);
  snapperContainer.appendChild(snapperInfo);
  document.body.appendChild(snapperContainer);
}

function createSnapperColorBoxes() {
  snapperElement.innerHTML = '';

  // Create the color boxes inside the snapper.
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
  snapperElement.appendChild(fragment);
}

/**
 * 
 */
function removeSnapper() {
  if (snapperContainer) {
    snapperContainer.remove();
  }
  snapperContainer = null;
  snapperElement = null;
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

    removeSnapper();
    createSnapper();

    // Now it's ready to pick color using snapper.
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

  updateSnapper(centerX, centerY);
}

function updateSnapper(centerX, centerY) {
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

  snapperContainer.style.display = '';
  snapperContainer.style.left = centerX - (containerBorder + count * boxSize / 2) + 'px';
  snapperContainer.style.top = centerY - (containerBorder + count * boxSize / 2) + 'px';

  const startX = centerX - parseInt(count / 2);
  const startY = centerY - parseInt(count / 2);
  for (let i = 0; i < count * count; i++) {
    const x = startX + (i % count);
    const y = startY + parseInt(i / count);
    //console.log(x, y);

    const colorBox = snapperElement.querySelector('#color-box-' + i);
    
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

      snapperInfo.style.backgroundColor = hex;
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

  snapperContainer.style.width = boxSize * count + 'px';
  snapperContainer.style.height = boxSize * count + 'px';

  snapperElement.style.width = boxSize * count + 'px';
  snapperElement.style.height = boxSize * count + 'px';

  snapperGrid.style.width = boxSize * count + 'px';
  snapperGrid.style.height = boxSize * count + 'px';
  snapperGrid.style.backgroundImage = 
    'repeating-linear-gradient(to right, ' + gridColor + ' 0, ' + gridColor + ' 1px, transparent 1px, transparent ' + boxSize + 'px),' +
    'repeating-linear-gradient(to bottom, ' + gridColor + ' 0, ' + gridColor + ' 1px, transparent 1px, transparent ' + boxSize + 'px)';

  snapperInfo.style.top = (count * boxSize + 4 - 34) / 2 + 'px';
  snapperInfo.style.left = (count + 1) / 2 * boxSize + 20 + 'px';

  createSnapperColorBoxes();

  updateSnapper(centerX, centerY);
}

function enlarge() {
  if (boxSize >= 25) {
    return;
  }

  boxSize++;

  snapperContainer.style.width = boxSize * count + 'px';
  snapperContainer.style.height = boxSize * count + 'px';

  snapperElement.style.width = boxSize * count + 'px';
  snapperElement.style.height = boxSize * count + 'px';

  snapperGrid.style.width = boxSize * count + 'px';
  snapperGrid.style.height = boxSize * count + 'px';
  snapperGrid.style.backgroundImage = 
    'repeating-linear-gradient(to right, ' + gridColor + ' 0, ' + gridColor + ' 1px, transparent 1px, transparent ' + boxSize + 'px),' +
    'repeating-linear-gradient(to bottom, ' + gridColor + ' 0, ' + gridColor + ' 1px, transparent 1px, transparent ' + boxSize + 'px)';

  snapperInfo.style.top = (count * boxSize + 4 - 34) / 2 + 'px';
  snapperInfo.style.left = (count + 1) / 2 * boxSize + 20 + 'px';

  createSnapperColorBoxes();

  updateSnapper(centerX, centerY);
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
  removeSnapper();

  document.removeEventListener('mousemove', updateSnapper);
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
          blink(snapperElement, () => {
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
