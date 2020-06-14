(function () {
  // Caches the screenshot image data.
  let imageData = null;
  let snipperContainer = null;
  let snipperElement = null;

  function createSnipper() {
    // Create the container.
    snipperContainer = document.createElement('div');
    snipperContainer.style.position = 'absolute';
    snipperContainer.style.width = '90px';
    snipperContainer.style.height = '90px';
    snipperContainer.style.display = 'none';
    snipperContainer.style.zIndex = 999999;

    // Create the snipper.
    snipperElement = document.createElement('div');
    snipperElement.id = 'com.jeantimex.crx.color.snipper';
    snipperElement.style.position = 'absolute';
    snipperElement.style.width = '90px';
    snipperElement.style.height = '90px';
    snipperElement.style.borderRadius = '50%';
    snipperElement.style.border = 'solide #FFF 3px';
    snipperElement.style.overflow = 'hidden';
    snipperElement.style.display = 'flex';
    snipperElement.style.backgroundColor = '#999';
    snipperElement.style.cursor = 'none';
    snipperElement.style.boxSizing = 'border-box';
    snipperElement.style.flexWrap = 'wrap';
    snipperElement.style.margin = '0px';
    snipperElement.style.padding = '0px';

    // Create the color boxes inside the snipper.
    for (let i = 0; i < 81; i++) {
      const colorBox = document.createElement('div');
      colorBox.id = 'color-box-' + i;
      colorBox.style.width = '10px';
      colorBox.style.height = '10px';
      colorBox.style.boxSizing = 'border-box';
      colorBox.style.backgroundColor = 'red';

      if (i === 40) {
        colorBox.style.border = '1px solid #FFF';
      }
      snipperElement.appendChild(colorBox);
    }

    snipperContainer.appendChild(snipperElement);
    document.body.appendChild(snipperContainer);
  }

  /**
   * 
   */
  function removeSnipper() {
    if (snipperContainer) {
      snipperContainer.remove();
    }
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
      document.removeEventListener('mousemove', updateSnipper);
      document.addEventListener('mousemove', updateSnipper);

      document.removeEventListener('mousedown', saveData);
      document.addEventListener('mousedown', saveData);

      document.removeEventListener('keydown', handleKeydown);
      document.addEventListener('keydown', handleKeydown);
    };

    img.src = dataUri;
    img.style.position = 'absolute';
  }

  function updateSnipper(event) {
    event.stopPropagation();

    if (!imageData) {
      return;
    }

    // Prepare your X Y coordinates which you will be fetching from your mouse loc
    let x = event.clientX;
    let y = event.clientY;
    // locate index of current pixel
    const centerIdx = (y * imageData.width + x) * 4;

    let red = imageData.data[centerIdx];
    let green = imageData.data[centerIdx+1];
    let blue = imageData.data[centerIdx+2];
    let alpha = imageData.data[centerIdx+3];
    // Output
    //console.log('pix x ' + x +' y '+y+ ' index '+index +' COLOR '+red+','+green+','+blue+','+alpha);

    snipperContainer.style.display = '';
    snipperContainer.style.left = x - 45 + 'px';
    snipperContainer.style.top = y - 45 + 'px';

    const startX = x - 4;
    const startY = y - 4;
    for (let i = 0; i < 81; i++) {
      x = startX + (i % 9);
      y = startY + parseInt(i / 9);
      //console.log(x, y);

      const colorBox = snipperElement.querySelector('#color-box-' + i);
      
      const index = (y * imageData.width + x) * 4;
      //console.log(index);

      if (index >= 0 && index + 3 < imageData.data.length) {
        red = imageData.data[index];
        green = imageData.data[index+1];
        blue = imageData.data[index+2];
        alpha = imageData.data[index+3];
        //console.log(red, green, blue, alpha);
      } else {
        red = 255;
        green = 255;
        blue = 255;
        alpha = 1;
      }
      colorBox.style.backgroundColor = `rgba(${red},${green},${blue},${alpha})`;
    }
  }

  function handleKeydown(event) {
    event.stopPropagation();

    if (event.key === 'Escape') {
      quit();
    }
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
            quit();
          }, (error) => {
            quit();
          });
        });
      }
    });
  }

  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.cmd === 'start') {
       updateImageData(request.dataUri);
      }
    }
  );
})();
