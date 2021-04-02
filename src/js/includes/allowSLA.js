// Check if model can be printed with SLA
// It means that the bounding box must not be greater than 115 x 65 x 150 mm
const NodeStl = require('node-stl');

function shouldAllowSLA(path, scale) {
  let stl = new NodeStl(path, {density: 1.27}); // PLA has 1.27 g/mm^3 density
  let boundingBox = stl.boundingBox;  
  return (boundingBox[0] * scale > 115 || boundingBox[1] * scale > 65 || boundingBox[2] * scale > 150) ? 0 : 1;
}

module.exports = shouldAllowSLA;
