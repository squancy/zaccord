const LIT_FORMS = ['Domború', 'Homorú', 'Sima'];
const PRINT_COLORS = ['Fekete', 'Fehér', 'Kék', 'Zöld', 'Arany', 'Piros', 'Sárga',
  'Zölden Foszforeszkáló'];
const HEX_ARR = ['#000000', '#ffffff', '#0089ff', '#7aff00', '#FFD700', '#FF0000', '#FFFF66',
  '#90EE90'];
const LAYER_WIDTH_VALUES = [0.12, 0.2, 0.28];
const INFILL_VALUES = [10];
const LIT_PRICES = {'100': 1990, '150': 2990, '200': 3990};
for (let i = 20; i <= 80; i += 20) {
  INFILL_VALUES.push(i);
}

const SCALE_VALUES = [2];
for (let i = 0.7; i <= 1.3; i += 0.3) {
  SCALE_VALUES.push(Number(i.toFixed(2)));
}

const WALL_WIDTH_VALUES = [];
for (let i = 0.8; i <= 2.4; i += 0.4) {
  WALL_WIDTH_VALUES.push(Number(i.toFixed(2)));
}
