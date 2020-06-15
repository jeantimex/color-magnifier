(function () {
  // Caches the screenshot image data.
  let imageData = null;
  let snipperContainer = null;
  let snipperElement = null;
  let snipperInfo = null;
  let infoValue = null;
  let notification = null;

  let boxSize = 4; // 4px
  const count = 25;

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

  function createSnipper() {
    // Create the container.
    snipperContainer = document.createElement('div');
    snipperContainer.style.position = 'absolute';
    snipperContainer.style.display = 'none';
    snipperContainer.style.zIndex = 999999;
    snipperContainer.style.width = boxSize * count + 'px';
    snipperContainer.style.height = boxSize * count + 'px';

    // Create the snipper.
    snipperElement = document.createElement('div');
    snipperElement.id = 'com.jeantimex.crx.color.snipper';
    snipperElement.style.position = 'absolute';
    snipperElement.style.borderRadius = '50%';
    snipperElement.style.border = 'solid #666 2px';
    snipperElement.style.overflow = 'hidden';
    snipperElement.style.display = 'flex';
    snipperElement.style.backgroundColor = '#999';
    snipperElement.style.cursor = 'none';
    snipperElement.style.boxSizing = 'content-box';
    snipperElement.style.flexWrap = 'wrap';
    snipperElement.style.margin = '0px';
    snipperElement.style.padding = '0px';
    snipperElement.style.opacity = '1';

    snipperElement.style.width = boxSize * count + 'px';
    snipperElement.style.height = boxSize * count + 'px';
    createSnipperColorBoxes();

    // info
    snipperInfo = document.createElement('div');
    snipperInfo.style.position = 'absolute';
    snipperInfo.style.boxSizing = 'border-box';
    snipperInfo.style.display = 'flex';
    snipperInfo.style.flexDirection = 'column';
    snipperInfo.style.justifyContent = 'space-between';
    snipperInfo.style.padding = '5px';
    snipperInfo.style.fontSize = '10px';
    snipperInfo.style.width = '78px';
    snipperInfo.style.height = '34px';
    snipperInfo.style.backgroundColor = '#474f59';
    snipperInfo.style.color = '#FFF';
    snipperInfo.style.top = (count * boxSize + 4 - 34) / 2 + 'px';
    snipperInfo.style.left = count * boxSize / 2 + 15 + 'px';

    const infoTitle = document.createElement('p');
    infoTitle.style.padding = '0px';
    infoTitle.style.margin = '0px';
    infoTitle.textContent = 'Display Hex';
    snipperInfo.appendChild(infoTitle);

    infoValue = document.createElement('p');
    infoValue.style.padding = '0px';
    infoValue.style.margin = '0px';
    infoValue.id = 'color-info-value';
    snipperInfo.appendChild(infoValue);

    snipperContainer.appendChild(snipperElement);
    snipperContainer.appendChild(snipperInfo);
    document.body.appendChild(snipperContainer);
  }

  function createSnipperColorBoxes() {
    snipperElement.innerHTML = '';

    // Create the color boxes inside the snipper.
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < count * count; i++) {
      const colorBox = document.createElement('div');
      colorBox.id = 'color-box-' + i;
      colorBox.style.width = boxSize + 'px';
      colorBox.style.height = boxSize + 'px';
      colorBox.style.boxSizing = 'border-box';
      colorBox.style.backgroundColor = 'red';

      if (i === parseInt((count * count) / 2)) {
        colorBox.style.border = '1px solid #FFF';
      }
      fragment.appendChild(colorBox);
    }
    snipperElement.appendChild(fragment);
  }

  /**
   * 
   */
  function removeSnipper() {
    if (snipperContainer) {
      snipperContainer.remove();
    }
    snipperContainer = null;
    snipperElement = null;
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

      removeSnipper();
      createSnipper();

      // Now it's ready to pick color using snipper.
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

    updateSnipper(centerX, centerY);
  }

  function updateSnipper(centerX, centerY) {
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

    snipperContainer.style.display = '';
    snipperContainer.style.left = centerX - (count * boxSize / 2) + 'px';
    snipperContainer.style.top = centerY - (count * boxSize / 2) + 'px';

    const startX = centerX - parseInt(count / 2);
    const startY = centerY - parseInt(count / 2);
    for (let i = 0; i < count * count; i++) {
      const x = startX + (i % count);
      const y = startY + parseInt(i / count);
      //console.log(x, y);

      const colorBox = snipperElement.querySelector('#color-box-' + i);
      
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

      if (i === parseInt(count * count / 2)) {
        const hex = '#' + RGBToHex(red, green, blue, alpha);
        if (lightOrDark(hex) === 'light') {
          colorBox.style.borderColor = '#666';
        } else {
          colorBox.style.borderColor = '#FFF';
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

    snipperContainer.style.width = boxSize * count + 'px';
    snipperContainer.style.height = boxSize * count + 'px';

    snipperElement.style.width = boxSize * count + 'px';
    snipperElement.style.height = boxSize * count + 'px';

    snipperInfo.style.top = (count * boxSize + 4 - 34) / 2 + 'px';
    snipperInfo.style.left = count * boxSize / 2 + 15 + 'px';

    createSnipperColorBoxes();

    updateSnipper(centerX, centerY);
  }

  function enlarge() {
    if (boxSize >= 10) {
      return;
    }

    boxSize++;

    snipperContainer.style.width = boxSize * count + 'px';
    snipperContainer.style.height = boxSize * count + 'px';

    snipperElement.style.width = boxSize * count + 'px';
    snipperElement.style.height = boxSize * count + 'px';

    snipperInfo.style.top = (count * boxSize + 4 - 34) / 2 + 'px';
    snipperInfo.style.left = count * boxSize / 2 + 15 + 'px';

    createSnipperColorBoxes();

    updateSnipper(centerX, centerY);
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
    colorValue.innerHTML = 'Copied ' + '<span style="font-weight:bold;">' +
      r + g + b + '</span> to clipboard!';

    notification.style.opacity = '1';
    notification.style.top = '10px';

    setTimeout(function () {
      notification.style.opacity = '0';
      notification.style.top = '0px';
    }, 2000);
  }

  function quit() {
    imageData = null;
    removeSnipper();

    document.removeEventListener('mousemove', updateSnipper);
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
            blink(snipperElement, () => {
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
})();
