const calcSLAPrice = require('./calcSLAPrice.js');
const calcLitPrice = require('./calcLitPrice.js');
const calcPrice = require('./calcPrice.js');
const constants = require('./constants.js');
const SLA_MULTIPLIER = constants.slaMultiplier;

function validatePrices(PRINT_MULTS, d) {
  let p = d.price;
  let bp = d.basePrice;
  let tech = d.tech; 
  let rvas = d.rvas;
  let infill = d.suruseg;
  let fvas = d.fvas;
  let scale = d.scale;
  let printMat = d.printMat;
  let pt = d.prodType;
  if (tech == 'SLA' && p != calcSLAPrice(bp * SLA_MULTIPLIER, rvas, infill, scale)) {
    return false;
  } else if (((pt == 'cp' && tech != 'SLA') || (pt == 'fp'))
    && p != calcPrice(PRINT_MULTS, bp, rvas, infill, scale, fvas, printMat)) {
    return false;
  } else if (pt == 'lit' && p != calcLitPrice(d.size)) {
    return false;
  }
  return true;
}

module.exports = validatePrices;
