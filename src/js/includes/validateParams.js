const constants = require('./constants.js');
const PRINT_COLORS = [...constants.printColors]; // create a copy because it's later altered
const LAYER_WIDTH_VALUES = constants.layerWidthValues;
const INFILL_VALUES = constants.infillValues;
const SCALE_VALUES = constants.scaleValues;
const WALL_WIDTH_VALUES = constants.wallWidthValues;

for (let i = 0; i < PRINT_COLORS.length; i++) {
  PRINT_COLORS[i] = PRINT_COLORS[i].toLowerCase();
}

// Validate customization parameters
function validateParams(obj) {
  for (let k of Object.keys(obj)) {
    if (k === 'rvas' && LAYER_WIDTH_VALUES.indexOf(Number(obj[k])) < 0) {
      return false;
    } else if (k === 'suruseg' && INFILL_VALUES.indexOf(Number(obj[k])) < 0) {
      return false;
    } else if (k === 'color' && PRINT_COLORS.indexOf(obj[k].toLowerCase()) < 0) {
      return false;
    } else if (k === 'scale' && SCALE_VALUES.indexOf(Number(obj[k])) < 0) {
      return false;
    } else if (k === 'fvas' && WALL_WIDTH_VALUES.indexOf(Number(obj[k])) < 0) {
      return false;
    } else if ((k === 'q' || k === 'quantity') &&
      (obj[k] % 1 !== 0 || obj[k] < 1 || obj[k] > 10)) {
      return false;
    }
  }
  return true;
}

module.exports = validateParams;
