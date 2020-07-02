/*
  Image processing is done with the MarvinJ Image Processing Library
*/

function toggleLit(state, url, can, img) {
  let canvas = _(can);
  if (state) {
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
      _(img).style.backgroundImage = `url('${base64}')`
      _(img).classList = 'animate__animated animate__fadeIn bgCommon litImg productItem'
      _(img).addEventListener('animationend', () => {
        _(img).classList = 'bgCommon litImg productItem';
      });
    }
  } else {
    _(img).classList = 'animate__animated animate__fadeIn bgCommon litImg productItem'
    _(img).style.backgroundImage = `url('${url}')`
  }
}

if (window.mobileCheck()) {
  let state = true;
  window.addEventListener('DOMContentLoaded', (event) => {
    _('clickNote').style.display = 'block';
  });

  // Remove old event listeners (mouseover, mouseleave) if user is on mobile
  _('img_0').onmouseover = null;
  _('img_0').onmouseleave = null;
  _('img_0').addEventListener('click', () => {
    let url = _('img_0').getAttribute('data-src');
    toggleLit(state, url, 'can_0', 'img_0');
    state = !state;
  }); 
}

// Fill in <select> with dynamic sizes
let img = new Image();
let sizesObj = {};
img.src = _('img_0').getAttribute('data-src');
img.onload = function() {
  let ratio = Math.min(this.width / this.height, this.height / this.width);
  saveToCookies(ratio);
  for (let s of [100, 150, 200]) {
    let selected = s == 150 ? 'selected' : '';
    sizesObj[s] = `${s.toFixed(2)}mm x ${(s * ratio).toFixed(2)}mm x 2.00mm`;
    _('size').innerHTML += `
      <option value="${s}x${(s * ratio).toFixed(2)}x2" ${selected}>
        ${s.toFixed(2)}mm x ${(s * ratio).toFixed(2)}mm x 2.00mm
      </option>
    `;
  }
  _('sizeHolder').innerHTML = `150.00mm x ${(150 * ratio).toFixed(2)}mm x 2.00mm`;
}

function updateLit() {
  let firstCoord = _('size').value.split('x')[0].replace('mm', '');
  if (firstCoord == '100') {
    _('priceHolder').innerText = '3490';
  } else if (firstCoord == '150') {
    _('priceHolder').innerText = '4990';
  } else {
    _('priceHolder').innerText = '7990';
  }
  _('sizeHolder').innerText = sizesObj[firstCoord];
}

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
