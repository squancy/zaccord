const LIT_FORMS = ['Domború', 'Homorú', 'Sima'];
const PRINT_COLORS = ['Fekete', 'Fehér', 'Kék', 'Zöld', 'Arany', 'Piros', 'Sárga',
  'Citromsárga'];
const HEX_ARR = ['#000000', '#ffffff', '#0089ff', '#7aff00', '#FFD700', '#FF0000', '#FFFF66',
  '#FFFF00'];
const LAYER_WIDTH_VALUES = [0.12, 0.2, 0.28];
const INFILL_VALUES = [10];
const LIT_PRICES = {'100': 1990, '150': 2990, '200': 3990};
for (let i = 20; i <= 80; i += 20) {
  INFILL_VALUES.push(i);
}
const LAYER_WIDTH_VALUES_SLA = [0.05, 0.07, 0.1];
const INFILL_VALUES_SLA = ['Üreges', 'Tömör'];

const SCALE_VALUES = [2];
for (let i = 0.1; i <= 1.0; i += 0.1) {
  SCALE_VALUES.push(Number(i.toFixed(2)));
}

const WALL_WIDTH_VALUES = [];
for (let i = 0.8; i <= 2.4; i += 0.4) {
  WALL_WIDTH_VALUES.push(Number(i.toFixed(2)));
}

const PRINT_MATERIALS = ['PLA', 'ABS', 'PETG', 'TPU'];
const MIN_PRICE = 800;
