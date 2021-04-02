const constants = require('./constants.js');
const PRINT_COLORS = [...constants.printColors]; // create a copy because it's later altered
const LAYER_WIDTH_VALUES = constants.layerWidthValues;
const INFILL_VALUES = constants.infillValues;
const SCALE_VALUES = constants.scaleValues;
const WALL_WIDTH_VALUES = constants.wallWidthValues;
const PRINT_MATERIALS = constants.printMaterials;
const LAYER_WIDTH_VALUES_SLA = constants.layerWidthValuesSLA;
const INFILL_VALUES_SLA = constants.infillValuesSLA;

for (let i = 0; i < PRINT_COLORS.length; i++) {
  PRINT_COLORS[i] = PRINT_COLORS[i].toLowerCase();
}

// Validate customization parameters
function validateParams(obj) {
  console.log(obj)
  for (let k of Object.keys(obj)) {
    let tech = obj.tech;
    if (tech != 'SLA') {
      var lwVals = LAYER_WIDTH_VALUES;
      var infVals = INFILL_VALUES;
    } else {
      var lwVals = LAYER_WIDTH_VALUES_SLA;
      var infVals = INFILL_VALUES_SLA;
    }

    if (k === 'rvas' && lwVals.indexOf(Number(obj[k])) < 0) {
      return false;
    } else if (k === 'suruseg' && infVals.indexOf(tech != 'SLA' ? Number(obj[k]) : obj[k]) < 0) {
      return false;
    } else if (k === 'color' && PRINT_COLORS.indexOf(obj[k].toLowerCase()) < 0) {
      return false;
    } else if (k === 'scale' && SCALE_VALUES.indexOf(Number(obj[k])) < 0) {
      return false;
    } else if (tech != 'SLA' && k === 'fvas' && WALL_WIDTH_VALUES.indexOf(Number(obj[k])) < 0) {
      return false;
    } else if ((k === 'q' || k === 'quantity') &&
      (obj[k] % 1 !== 0 || obj[k] < 1 || obj[k] > 10)) {
      return false;
    } else if (tech != 'SLA' && k == 'printMat' && PRINT_MATERIALS.indexOf(obj[k]) < 0) {
      return false;
    }
  }
  return true;
}

module.exports = validateParams;
