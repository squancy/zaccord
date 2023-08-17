const constants = require('./constants.js');
const MIN_PRICE = constants.minPrice;
const smoothPrice = constants.smoothPrice;

// Calculate the exact price of an SLA printed model given the needed parameters
function calcSLAPrice(p, lw, infill, scale) {
  let multiplier = infill == 'Tömör' ? 1 : 0.8;
  let fp = smoothPrice(Math.round(p * (1 / (lw * 70) + 0.7142857142857143) * multiplier * scale));
  return fp < MIN_PRICE ? MIN_PRICE : fp;
}

module.exports = calcSLAPrice;
