const constants = require('./constants.js');
const LIT_PRICES = constants.litPrices;

function calcLitPrice(size) {
  let firstCoord = size.split('x')[0].replace('mm', '');
  return LIT_PRICES[firstCoord];
}

module.exports = calcLitPrice;
