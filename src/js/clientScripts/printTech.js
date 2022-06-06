// Toggle print technologies and update UI accordingly
function changeTech(techBefore, tid, price) {
  const isSLA = techBefore == 'FDM' ? true : false;
  const lwValues = isSLA ? LAYER_WIDTH_VALUES_SLA : LAYER_WIDTH_VALUES;
  const infillValues = isSLA ? INFILL_VALUES_SLA : INFILL_VALUES;
  let cookieVals = JSON.parse(getCookie('cartItems'));
  
  // Change print technology in cookies & get saved base price
  let currentTech = isSLA ? 'SLA' : 'FDM';
  let scaleVal = cookieVals['content_' + tid]['scale_' + tid];
  cookieVals['content_' + tid]['tech_' + tid] = isSLA ? 'SLA' : 'FDM';
  cookieVals['content_' + tid]['quantity_' + tid] = '1';
  if (!isSLA) {
    cookieVals['content_' + tid]['rvas_' + tid] = '0.2';
    cookieVals['content_' + tid]['suruseg_' + tid] = '20';
    cookieVals['content_' + tid]['fvas_' + tid] = '1.2';
    cookieVals['content_' + tid]['printMat_' + tid] = 'PLA';
    cookieVals['content_' + tid]['color_' + tid] = encodeURIComponent(PCOLORS['pla'][0]);
  } else {
    cookieVals['content_' + tid]['rvas_' + tid] = '0.05';
    cookieVals['content_' + tid]['suruseg_' + tid] = encodeURIComponent('Tömör');
    cookieVals['content_' + tid]['color_' + tid] = encodeURIComponent(PCOLORS['gyanta (resin)'][0]);
  }
  setCookie('cartItems', JSON.stringify(cookieVals), 365);
  let originalPrice = Number(cookieVals['content_' + tid]['price_' + tid]);
  let oldPrice = Number(_('totpHolder_' + tid));
  
  let content = `
    <div id="unitPrice_${tid}">
      ${_('unitPrice_' + tid).innerHTML}
    </div>
  `;

  content += `
    <div>
      <p>
        Rétegvastagság:
        <select class="specSelect chItem" id="rvas${tid}"
          onchange="updateSpecs(this, ${price}, '${tid}', false, true, ${isSLA})">
  `;
  
  for (let lw of lwValues) {
    let selected = '';
    if ((!isSLA && lw == 0.2) || (isSLA && lw == 0.05)) selected = 'selected';
    content += `<option value="${lw.toFixed(2)}" ${selected}>${lw.toFixed(2)}mm</option>`;
  } 

  content += `
        </select>
      </p>
    </div>
    <div>
      <p>
        Sűrűség:
        <select class="specSelect chItem" id="suruseg${tid}"
          onchange="updateSpecs(this, ${price}, '${tid}', false, true, ${isSLA})">
  `;
  
  let postfix = isSLA ? '' : '%';
  for (let inf of infillValues) {
    let selected = '';
    if ((!isSLA && inf == 20) || (isSLA && inf == 'Tömör')) selected = 'selected';
    content += `
      <option value="${inf}" ${selected}>${inf}${postfix}</option>
    `;
  }

  content += `
        </select>
      </p>
    </div>
  `;
  
  content += `
    <div id="scaleDiv_${tid}">
      ${_('scaleDiv_' + tid).innerHTML}
    </div>
  `;

  // Wall width and print material only applies to FDM
  if (!isSLA) {
    content += `
      <div>
        <p>
          Falvastagság:
          <select class="specSelect chItem" id="fvas${tid}"
            onchange="updateSpecs(this, ${price}, '${tid}', false, true, ${isSLA})">
    `;

    for (let ww of WALL_WIDTH_VALUES) {
      content += `
        <option value="${ww.toFixed(1)}">${ww.toFixed(1)}mm</option>
      `; 
    }

    content += `
          </select>
        </p>
      </div>
      <div>
        <p>
          Nyomtatási Anyag:
          <select class="specSelect chItem" id="printMat${tid}"
            onchange="updateSpecs(this, ${price}, '${tid}', false, true, ${isSLA})">
    `;

    for (let pm of Object.keys(PCOLORS).filter(e => e != 'gyanta (resin)').map(e => e.toUpperCase())) {
      content += `<option value="${pm}">${pm}</option>`;
    }
    
    content += `
          </select>
        </p>
      </div>
    `; 
  }
  
  let colorContent = '';
  let ind = isSLA ? 'gyanta (resin)' : 'pla';
  for (let i = 0; i < PCOLORS[ind].length; i++) {
    let color = PCOLORS[ind][i];
    let selected = i == 0 ? 'selected' : '';
    colorContent += `<option value="${color}" ${selected}>${color}</option>`;
  }

  content += `
    <div id="colorDiv_${tid}">
      <p>
        Szín:
        <select class="specSelect chItem" id="color${tid}" onchange="chColor(this, '${tid}')">
          ${colorContent}
        </select>
      </p>
    </div>
  `;

  content += `
    <div id="quantityDiv_${tid}">
      ${_('quantityDiv_' + tid).innerHTML}
    </div>
  `;

  content += `
    <div id="printTechDiv_${tid}">
      ${_('printTechDiv_' + tid).innerHTML}
    </div>
  `;

  _('uniqueCont_' + tid).innerHTML = content;
  _('scale' + tid).value = scaleVal;
  cookieVals['content_' + tid]['scale_' + tid] = scaleVal;
  setCookie('cartItems', JSON.stringify(cookieVals), 365);

  let newPrice;
  if (isSLA) {
    newPrice = calcSLAPrice(Math.round(originalPrice * SLA_MULTIPLIER), 0.05, 'Tömör', scaleVal);
  } else {
    _('fvas' + tid).value = '1.2';
    newPrice = calculatePrice(originalPrice, tid, false, true);
  }

  _('uniqueCont_' + tid).innerHTML += `
    <div>
      <p class="bold">Összesen: <span id="totpHolder_${tid}">
        ${newPrice}</span> Ft
      </p>
    </div>
  `;

  _('printTech' + tid).setAttribute('onchange', `changeTech('${currentTech}', '${tid}', ${price})`);
  _('printTech' + tid).value = currentTech;
  _('priceHolder_' + tid).innerText = newPrice
  let onch = `updateSpecs(this, ${price}, '${tid}', false, true, ${isSLA})`;
  _('quantity' + tid).setAttribute('onchange', onch);
  _('scale' + tid).setAttribute('onchange', onch);
  updateTotPrice(tid, newPrice, oldPrice, false, true, isSLA);
  $('#scale' + tid).off();
  attachHandlers();
  _('scale' + tid).value = scaleVal;
  _('quantity' + tid).value = '1';
  if (_('fvas' + tid)) _('fvas' + tid).value = '1.2';
  cookieVals['content_' + tid]['scale_' + tid] = scaleVal;
  setCookie('cartItems', JSON.stringify(cookieVals), 365);
}

function toggleUIAllowance(shouldSkip, id, tech, price) {
  if (shouldSkip) {
    if (tech == 'SLA') changeTech('SLA', id, price);
    _('printTech' + id).innerHTML = '<option value="FDM">FDM</option>';  
    $('#scale' + id).off();
    attachHandlers();
  } else {
    let valueBefore = _('printTech' + id).value;
    if (valueBefore == 'FDM') {
      var fdmSel = 'selected';
      var slaSel = '';
    } else {
      var fdmSel = '';
      var slaSel = 'selected';     
    }
    _('printTech' + id).innerHTML = `
      <option value="FDM" ${fdmSel}>FDM</option>
      <option value="SLA" ${slaSel}>SLA</option>
    `;
  }
}

function toggleTechAllowance(id) {
  let cookieVals = JSON.parse(getCookie('cartItems'));
  let currentTech = cookieVals['content_' + id]['tech_' + id];
  let price = cookieVals['content_' + id]['price_' + id];
  toggleSLAAllowance('scale' + id, [id], toggleUIAllowance, [id, currentTech, price]);
}
