const LAYER_HEIGHT = [];
for (let lh of [0.12, 0.20, 0.28]) {
  LAYER_HEIGHT.push(lh);
}

const INFILL = [];
for (let i = 10; i <= 90; i += 10) {
  INFILL.push(i);
}

const SCALE = [];
for (let i = 1; i <= 10; i++) {
  SCALE.push(i / 10);
}

const WALL_WIDTH = [];
for (let i = 8; i <= 40; i += 4) {
  WALL_WIDTH.push(i / 10);
}

const LAYER_HEIGHT_SLA = [];
for (let lh of [0.05, 0.07, 0.10]) {
  LAYER_HEIGHT_SLA.push(lh);
}

const INFILL_SLA = [];
for (let inf of ['Tömör', 'Üreges']) {
  INFILL_SLA.push(inf);
}

let exp = {
  layerHeight: LAYER_HEIGHT,
  infill: INFILL,
  scale: SCALE,
  wallWidth: WALL_WIDTH,
  layerHeightSLA: LAYER_HEIGHT_SLA,
  infillSLA: INFILL_SLA
};

module.exports = exp;
