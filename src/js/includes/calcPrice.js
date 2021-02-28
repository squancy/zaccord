// Calculate the final price of a product, given its initial price + parameters
function calcPrice(price, rvasVal, surusegVal, scaleVal, fvasVal, filamentMaterial = false) {
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
    if (filamentMaterial == 'PLA') {
      multiplier = 1;
    } else if (filamentMaterial == 'ABS' || filamentMaterial == 'PETG') {
      multiplier = 1.36;
    } else if (filamentMaterial == 'TPU') {
      multiplier = 1.814;
    } else {
      multiplier = 2;
    }
  }

  return Math.round(nPrice * multiplier);
}

module.exports = calcPrice;
