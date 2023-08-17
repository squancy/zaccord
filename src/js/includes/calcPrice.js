const constants = require('./constants.js');
const MIN_PRICE = constants.minPrice;
const smoothPrice = constants.smoothPrice;

// Calculate the final price of a product, given its initial price + parameters
function calcPrice(PRINT_MULTS, price, rvasVal, surusegVal, scaleVal, fvasVal, filamentMaterial = false) {
  // Convert degrees to radians
  rvasVal *= Math.PI / 180
  surusegVal *= Math.PI / 180
  fvasVal *= Math.PI / 180

  // Formula for calculating the price with the given params
  // Parameters values in the formula are degrees (converted to rads)
  let nPrice = (price * scaleVal *
    ((1 / (Math.sin(rvasVal) * 140 + 0.51130880187)) +
    (Math.sin(surusegVal) / 1.3 + 0.73690758206) +
    (Math.sin(fvasVal) * 8 + 0.83246064094) - 2));
  
  let multiplier = 1;
  if (filamentMaterial) {
    multiplier = PRINT_MULTS[filamentMaterial.toLowerCase()];
  }

  let fp = smoothPrice(Math.round(nPrice * multiplier)); 
  return fp < MIN_PRICE ? MIN_PRICE : fp;
}

module.exports = calcPrice;
