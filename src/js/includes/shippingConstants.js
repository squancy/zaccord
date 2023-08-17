const PACKETA_POINT = 1390;
const POST_TO_ADDR = 1890;
const GLS_POINT = 1990;
const GLS_TO_ADDR = 2490;
const FREE_SHIPPING_LIMIT = 30000;
const MONEY_HANDLE = 390;
const PACKET_POINT_TYPES = ['packetaPoint', 'glsPoint'];
const PACKET_POINT_TYPES_R = ['pointPacketa', 'pointGls'];

const SHIPPING_OBJ = {
  'packeta': {
    title: 'Packeta csomagpont',
    desc: 'A Packetával partnerségben lévő futárszolgálat a megadott csomagpontra fogja szállítani a rendelt terméket/termékeket.',
    price: `Szállítási költség: ${FREE_SHIPPING_LIMIT} Ft alatt ${PACKETA_POINT} Ft, felette ingyenes.`,
    actualPrice: PACKETA_POINT,
    divID: 'packetaPoint',
    radioID: 'pointPacketa',
    trackURL: 'https://tracking.packeta.com/hu/tracking/search',
    more: '<div class="lh sel" id="selectedPacketaPoint" style="color: #4285f4; display: none;"></div>',
    prior: 2
  },

  'mpl': {
    title: 'MPL házhozszállítás',
    desc: 'A futárszolgálat a megadott címre fogja szállítani a rendelt terméket/termékeket.',
    price: `Szállítási költség: ${FREE_SHIPPING_LIMIT} Ft alatt ${POST_TO_ADDR} Ft, felette ingyenes.`,
    actualPrice: POST_TO_ADDR,
    divID: 'mplToAddr',
    radioID: 'toAddrMpl',
    trackURL: 'https://www.posta.hu/nyomkovetes/nyitooldal',
    more: '',
    prior: 1
  },

  'glsAddr': {
    title: 'GLS házhozszállítás',
    desc: 'A futárszolgálat a megadott címre fogja szállítani a rendelt terméket/termékeket.',
    price: `Szállítási költség: ${FREE_SHIPPING_LIMIT} Ft alatt ${GLS_TO_ADDR} Ft, felette ingyenes.`,
    actualPrice: GLS_TO_ADDR,
    divID: 'glsToAddr',
    radioID: 'toAddrGls',
    trackURL: 'https://gls-group.eu/HU/hu/csomagkovetes',
    more: '',
    prior: 4
  },

  'glsPoint': {
    title: 'GLS csomagpont átvétel',
    desc: 'A futárszolgálat a megadott csomagpontra fogja szállítani a rendelt terméket/termékeket.',
    price: `Szállítási költség: ${FREE_SHIPPING_LIMIT} Ft alatt ${GLS_POINT} Ft, felette ingyenes.`,
    actualPrice: GLS_POINT,
    divID: 'glsPoint',
    radioID: 'pointGls',
    trackURL: 'https://gls-group.eu/HU/hu/csomagkovetes',
    more: '<div class="lh sel" id="selectedPP" style="color: #4285f4; display: none;"></div>',
    prior: 3
  }
}

function getIDs(SHIPPING_OBJ, k) {
  let IDs = [];
  for (let key of Object.keys(SHIPPING_OBJ)) {
    IDs.push(SHIPPING_OBJ[key][k]);
  }
  return IDs;
}

function dToM(id) {
  let dict = {};
  for (let key of getIDs(SHIPPING_OBJ, id)) {
    for (let k of Object.keys(SHIPPING_OBJ)) {
      if (SHIPPING_OBJ[k][id] == key) {
        dict[key] = SHIPPING_OBJ[k]['actualPrice'];
      }
    }
  }
  return dict;
}

const DELIVERY_TO_MONEY = dToM('divID');
const DELIVERY_TO_MONEY_R = dToM('radioID');

module.exports = {
  shippingObj: SHIPPING_OBJ,
  freeShippingLimit: FREE_SHIPPING_LIMIT,
  moneyHandle: MONEY_HANDLE,
  getIDs: getIDs,
  deliveryToMoney: DELIVERY_TO_MONEY,
  deliveryToMoneyR: DELIVERY_TO_MONEY_R,
  packetPointTypes: PACKET_POINT_TYPES,
  packetPointTypesR: PACKET_POINT_TYPES_R
}
