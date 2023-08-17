const LIT_FORMS = ['Domború', 'Homorú', 'Sima'];
const LAYER_WIDTH_VALUES = [0.12, 0.2, 0.28];
const INFILL_VALUES = [];
const LIT_PRICES = {'100': 1990, '150': 2990, '200': 3990};
for (let i = 10; i <= 90; i += 10) {
  INFILL_VALUES.push(i);
}
const LAYER_WIDTH_VALUES_SLA = [0.05, 0.07, 0.1];
const INFILL_VALUES_SLA = ['Üreges', 'Tömör'];

const SCALE_VALUES = [2];
for (let i = 0.1; i <= 1.0; i += 0.1) {
  SCALE_VALUES.push(Number(i.toFixed(2)));
}

const WALL_WIDTH_VALUES = [];
for (let i = 0.8; i <= 4; i += 0.4) {
  WALL_WIDTH_VALUES.push(Number(i.toFixed(2)));
}

const MIN_PRICE = 1990;
const SLA_MULTIPLIER = 1.9;
const MAX_QUANTITY = 100;
const MIN_QUANTITY = 1;
const FREE_SHIPPING_LIMIT = 30000;
const DISCOUNT = 0.97;
const PRINT_SIZE_SLA = [250, 220, 120];
