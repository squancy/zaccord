const constants = require('./constants.js');
const MAX_QUANTITY = constants.maxQuantity;
const MIN_QUANTITY = constants.minQuantity;

function genQuan(chargeNote = '') {
  return `
    <div style="text-align: center;">
      <p class="gotham font14 qty" style="margin-bottom: 0; margin-top: 10px;">
        Mennyiség
      </p> 
      <div class="quantity buttons_added">
        <input type="button" value="-" class="minus" id="minus" style="padding-left: 11px;">
        <input type="number" step="1" min="${MIN_QUANTITY}" max="${MAX_QUANTITY}" name="quantity"
          value="1" title="Qty"
          class="input-text qty text" size="4" pattern="" inputmode="" id="quantity">
          <input type="button" value="+" class="plus" id="plus">
      </div>
    </div>
    ${chargeNote}
    <div class="contHolder flexDiv gotham" style="margin-top: 30px;">
      <div class="contTitle" id="descTitle" style="padding-left: 0;">
        <div>
          Specifikációk            
        </div>
        <div class="hoverItem" id="descTitle_anim" style="display: block;"></div>
      </div>
    </div>
  `; 
}

module.exports = genQuan;
