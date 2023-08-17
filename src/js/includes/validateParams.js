const specParams = require('./specParams.js');
const constants = require('./constants.js');
const getColors = require('./getColors.js');
const getMaterials = require('./getMaterials.js');
const LAYER_WIDTH_VALUES = specParams.layerHeight;
const INFILL_VALUES = specParams.infill;
const SCALE_VALUES = specParams.scale;
const WALL_WIDTH_VALUES = specParams.wallWidth;
const LAYER_WIDTH_VALUES_SLA = specParams.layerHeightSLA;
const INFILL_VALUES_SLA = specParams.infillSLA;
const MAX_QUANTITY = constants.maxQuantity;
const MIN_QUANTITY = constants.minQuantity;

// Validate customization parameters
function validateParams(conn, obj) {
  return new Promise((resolve, reject) => {
    let colorsPromise = getColors(conn);
    let matPromise = getMaterials(conn);
    Promise.all([colorsPromise, matPromise]).then(vals => {
      const PRINT_COLORS = vals[0][0];
      const PRINT_MATERIALS = Object.keys(vals[1]);
      
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
          resolve(false);
        } else if (k === 'suruseg' && infVals.indexOf(tech != 'SLA' ? Number(obj[k]) : obj[k]) < 0) {
          resolve(false);
        } else if (k === 'color' && PRINT_COLORS[obj.printMat.toLowerCase()].indexOf(obj[k]) < 0) {
          resolve(false);
        } else if (k === 'scale' && SCALE_VALUES.indexOf(Number(obj[k])) < 0) {
          resolve(false);
        } else if (tech != 'SLA' && k === 'fvas' && WALL_WIDTH_VALUES.indexOf(Number(obj[k])) < 0) {
          resolve(false);
        } else if ((k === 'q' || k === 'quantity') &&
          (obj[k] % 1 !== 0 || obj[k] < MIN_QUANTITY || obj[k] > MAX_QUANTITY)) {
          resolve(false);
        } else if (tech != 'SLA' && k == 'printMat' && PRINT_MATERIALS.indexOf(obj[k].toLowerCase()) < 0) {
          resolve(false);
        }
      }

      resolve(true);
    }).catch(err => {
      console.log(err);
      reject(err);
    });
  });
}

module.exports = validateParams;
