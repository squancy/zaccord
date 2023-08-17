// Check if model can be printed with SLA
const NodeStl = require('node-stl');
const constants = require('./constants.js');
const PRINT_SIZES_SLA = constants.printSizesSLA;

function shouldAllowSLA(path, scale) {
  let stl = new NodeStl(path, {density: 1.27}); // PLA has 1.27 g/mm^3 density
  let boundingBox = stl.boundingBox.sort((a, b) => b - a);  
  return (boundingBox[0] * scale > PRINT_SIZES_SLA[0] || boundingBox[1] * scale > PRINT_SIZES_SLA[1] || boundingBox[2] * scale > PRINT_SIZES_SLA[2]) ? 0 : 1;
}

module.exports = shouldAllowSLA;
