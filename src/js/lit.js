/*
  Image processing is done with the MarvinJ Image Processing Library
*/

/*
  When user hovers/clicks on the image uploaded show a lithophane view by applying the emboss
  algo
*/
let litImg;

function toggleLitImg(img, src) {
  _(img).style.backgroundImage = `url('${src}')`;
  _(img).classList = 'animate__animated animate__fadeIn bgCommon litImg productItem'
  _(img).addEventListener('animationend', () => {
    _(img).classList = 'bgCommon litImg productItem';
  });
}

let state = true;
function toggleLit(url, can, img) {
  let canvas = _(can);
  // If img is already rendered just display that one
  if (litImg && state) {
    toggleLitImg(img, litImg);
    state = false;
  } else if (state) {
    let image = new MarvinImage();
    
    image.load(url, imageLoaded);

    function imageLoaded() {
      let ratio = this.width / this.height;
      canvas.width = this.width;
      canvas.height = this.height;
      imageOut = image.clone();

      Marvin.emboss(image, imageOut);
      imageX = imageOut.clone();
      imageX.draw(canvas);
      let base64 = canvas.toDataURL();

      // Set the background to a base64 img calculated from the canvas
      // Also do a smooth fade in/fade out with Animate.js
      litImg = base64;
      toggleLitImg(img, base64);
      state = false;
    }
  } else {
    _(img).classList = 'animate__animated animate__fadeIn bgCommon litImg productItem'
    _(img).style.backgroundImage = `url('${url}')`
    state = true;
  }
}

if (window.location.href.includes('?image=')) {
  let fname = window.location.href.split('?image=')[1];
  localStorage.setItem('refresh', fname);
}

// If user is on mobile hovering changes to tapping & also display a notification msg about that
if (window.mobileCheck()) {
  let state = true;
  window.addEventListener('DOMContentLoaded', (event) => {
    _('clickNote').style.display = 'block';
  });
  _('chargeNote').style.display = 'none';
}

// Fill in size <select> with dynamic sizes
let img = new Image();
let sizesObj = {};
img.src = _('img_0').getAttribute('data-src');
img.onload = function() {
  let ratio = Math.min(this.width / this.height, this.height / this.width);
  saveToCookies(ratio);

  /*
    The width/height of the lithophane is 100/150/200mm, the other dimension is calculated
    from the image, proportionally. The depth is always 2mm.
  */
  for (let s of [100, 150, 200]) {
    let selected = s == 150 ? 'selected' : '';
    sizesObj[s] = `${s.toFixed(2)}mm x ${(s * ratio).toFixed(2)}mm x 2.00mm`;
    _('size').innerHTML += `
      <option value="${s}x${(s * ratio).toFixed(2)}x2" ${selected}>
        ${s.toFixed(2)}mm x ${(s * ratio).toFixed(2)}mm x 2.00mm
      </option>
    `;
  }

  // If the page is viewed for the 1st time save ID to the localStorage
  if (!localStorage.getItem('refresh')) {
    let tmp = arr[0].split('/');
    tmp = tmp[tmp.length - 1].replace('.png', '').replace('.jpeg', '').replace('.jpg', '');
    localStorage.setItem('refresh', tmp);
    _('sizeHolder').innerHTML = `150.00mm x ${(150 * ratio).toFixed(2)}mm x 2.00mm`;
  } else {
    /*
      If page is loaded for the nth time (excluding 1) update the UI with already saved
      values in cookies
    */
    let soFar = JSON.parse(getCookie('cartItems'));
    let id = localStorage.getItem('refresh');
    let sphereVal = decodeURIComponent(soFar['content_' + id]['sphere_' + id]);
    let sizeVal = decodeURIComponent(soFar['content_' + id]['size_' + id]);
    let colorVal = decodeURIComponent(soFar['content_' + id]['color_' + id]);
    let quantityVal = decodeURIComponent(soFar['content_' + id]['quantity_' + id]);
    _('sphere').value = sphereVal;
    _('color').value = colorVal;
    _('size').value = sizeVal;
    _('quantity').value = quantityVal;

    let sizes = sizeVal.split('x').map(v => Number(v).toFixed(2)).join('mm x ') + 'mm';
    _('sizeHolder').innerText = sizes;
    updateLit();
    updateQtyUI();
  }
}

// Update the price of the lithophane based on its dimensions
function updateLit() {
  let firstCoord = _('size').value.split('x')[0].replace('mm', '');
  _('priceHolder').innerText = LIT_PRICES[firstCoord];
  _('sizeHolder').innerText = sizesObj[firstCoord];
}

// Redirect to buy page if btn is clicked
_('buyLit').addEventListener('click', function buyLithophane(e) {
  let sphere = encodeURIComponent(_('sphere').value);
  let size = _('size').value;
  let color = _('color').value;
  let q = _('quantity').value;
  window.location.href =
    `/buy?product=lit&sphere=${sphere}&size=${size}&color=${color}&file=${fileBuy}&q=${q}`;
});

// Update the changed values in cookies as well
_('sphere').addEventListener('change', () => updateCookie('sphere'));
_('size').addEventListener('change', () => updateCookie('size'));
_('color').addEventListener('change', () => updateCookie('color'));
_('plus').addEventListener('mouseup', () => updateCookie('quantity', 1));
_('minus').addEventListener('mouseup', () => updateCookie('quantity', -1));
_('quantity').addEventListener('change', () => updateCookie('quantity'));

function goToURL(url) {
  window.location.href = url;
}

_('toCart').addEventListener('click', (e) => goToURL('/cart'));
_('newFile').addEventListener('click', (e) => goToURL('/print'));
