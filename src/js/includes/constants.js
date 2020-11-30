const NodeStl = require('node-stl');

// Constant variables used for shopping & delivery
const SHIPPING_PRICE = 1490;
const MONEY_HANDLE = 390;

const DR = __dirname.replace('js/includes', '');

const FILES_TO_CACHE = [
  DR + 'animate/animate.css',
  DR + 'js/includes/jq.js',
  DR + 'js/includes/lazyLoad.js'
];

const COUNTRIES = ["Albánia", "Andorra", "Argentína", "Ausztrália", "Ausztria", "Azerbajdzsán",
    "Belgium", "Bosznia-Hercegovina", "Brazília", "Bulgária", "Kanada", "Chile", "Kína",
    "Horvátország", "Kuba", "Ciprus", "Cseh köztársaság", "Dánia", "Egyiptom", "Észtország",
    "Faroe-szigetek", "Finnország", "Franciaország", "Grúzia", "Németország", "Gibraltár",
    "Görögország", "Hong Kong", "Magyarország", "Izland", "India", "Indonézia", "Irán", "Irak",
    "Írország", "Izrael", "Olaszország", "Japán", "Kazahsztán", "Dél-Koreai Köztársaság",
    "Kuwait",
    "Lettország", "Liechtenstein", "Litvánia", "Luxemburg", "Makedónia", "Malajzia", "Málta",
    "Mexikó", "Monaco", "Marokkó", "Hollandia", "Új-Zéland", "Norvégia", "Paraguay",
    "Fülöp-szigetek", "Lengyelország", "Portugália", "Katar", "Románia", "Oroszország",
    "San Marino", "Szaud-Arábia", "Szlovákia", "Szlovénia", "Dél-afrikai Köztársaság",
    "Spanyolország", "Svédország", "Svájc", "Thaiföld", "Tunézia", "Törökország",
    "Türkmenisztán",
    "Ukrajna", "Egyesült Arab Emirátusok", "Egyesült Királyság", "Amerikai Egyesült Államok",
    "Uruguay", "Üzbégisztán", "Vatikáni városállam", "Venezuela", "Vietnám", "Szerbia",
    "Koszovó",
    "Montenegró"];

const MIN_PRICE = 800;
const FIX_ADD_CPRINT = 500;
const SUCCESS_RETURN = '{"success": true}';

// For printing
const B = 40; // build speed: 40mm/s
const N = 0.4; // nozzle size: 0.4mm
const T = 1; // thermal expansion
const De = 0.2; // default infill in percentage
const L = 0.2; // default layer height in mm
const M = 12; // cost/min in forint
const DENSITY = 1.27; // PLA density is 1.27 g/cm^3

// Create a piecewise defined function for smoothing out the price when its too big
function smoothPrice(P) {
  if (P <= 10000) {
    // f(x) = x
    return P;
  } else if (P <= 20000) {
    // f(x) = (-1.6 * 10 ^ (-5))x + 1.03
    return P * (-1.6 * Math.pow(10, -5) * P + 1.03);
  } else if (P <= 40000) {
    // f(x) = (-1.6 * 10 ^ (-5))x + 1.13
    return P * (-1.6 * Math.pow(10, -5) * P + 1.13);
  } else if (P <= 60000) {
    // f(x) = (-1.6 * 10 ^ (-5))x + 1.43
    return P * (-1.6 * Math.pow(10, -5) * P + 1.43);
  } else if (P <= 80000) {
    // f(x) = (-1.6 * 10 ^ (-5))x + 1.78
    return P * (-1.6 * Math.pow(10, -5) * P + 1.78);
  } else if (P <= 100000) {
    // f(x) = (-1.6 * 10 ^ (-5))x + 2.1
    return P * (-1.6 * Math.pow(10, -5) * P + 2.1);
  } else if (P <= 120000) {
    // f(x) = (-1.6 * 10 ^ (-5))x + 2.42
    return P * (-1.6 * Math.pow(10, -5) * P + 2.42);
  } else {
    // f(x) = (-1.6 * 10 ^ (-5))x + 2.75
    return P * (-1.6 * Math.pow(10, -5) * P + 2.75);
  }
}

// Calculate the price of a model from estimated print time
function calcCPPrice(W, H, D) {
  // If price is above 5K Ft then free after work, otherwise add +1K Ft
  let price = Math.round(smoothPrice(((W / B) * (D / ((N / T) / De)) * (H / L)) / 60 * M));
  if (price < 5000) return price + 1000;
  else return price;
}

// Get bounding box x, y, z coords
function getCoords(path) {
  let stl = new NodeStl(path, {density: DENSITY}); 
  let bbox = stl.boundingBox;
  return [bbox[0], bbox[1], bbox[2]];
}

function getPrintTime(W, H, D) {
  return Math.round((W / B) * (D / ((N / T) / De)) * (H / L));
}

// Constants for reference page
const NUM_OF_COLS = 3;
const NUM_OF_IMGS = 4;

module.exports = {
  'shippingPrice': SHIPPING_PRICE,
  'moneyHandle': MONEY_HANDLE,
  'countries': COUNTRIES,
  'minPrice': MIN_PRICE,
  'fixAddCprint': FIX_ADD_CPRINT,
  'successReturn': SUCCESS_RETURN,
  'calcCPPrice': calcCPPrice,
  'getPrintTime': getPrintTime,
  'getCoords': getCoords,
  'M': M,
  'numOfCols': NUM_OF_COLS,
  'numOfImgs': NUM_OF_IMGS,
  'filesToCache': FILES_TO_CACHE
};
