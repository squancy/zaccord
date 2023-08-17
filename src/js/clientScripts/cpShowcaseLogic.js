// Implement the logic of the image showcase on the custom print page
const mq = window.matchMedia('(max-width: 1000px)');
if (mq.matches) {
  _('lit_0').src = '/images/printShowcase/jungle_lit.jpg';
  _('lit_1').src = '/images/printShowcase/litSecondMob.jpg';
}

class ImageSegment {
  constructor(leftBtn, rightBtn, currentIndex, titleSources, textSources) {
    this.leftBtn = leftBtn;
    this.rightBtn = rightBtn;
    this.currentIndex = currentIndex;
    this.titleSources = titleSources;
    this.textSources = textSources;
  }

  attachHandlers(mod, showBox, id, titleBox, textBox) {
    this.leftBtn.addEventListener('click', (e) => {
      this.currentIndex = changeIndex('left', this.currentIndex, mod);
      advanceImage(showBox, id, titleBox, textBox, this.currentIndex, this.titleSources,
        this.textSources);
    });

    this.rightBtn.addEventListener('click', (e) => {
      this.currentIndex = changeIndex('right', this.currentIndex, mod + 1);
      advanceImage(showBox, id, titleBox, textBox, this.currentIndex, this.titleSources,
        this.textSources);
    });
  }
}

function changeClass(id, opcode) {
  _(id).classList[opcode]('animate__animated');
  _(id).classList[opcode]('animate__fadeIn');
}

function handleFade(cn) {
  changeClass(cn, 'add');
  setTimeout(() => {
    changeClass(cn, 'remove');
  }, 1000);
}

function hideOtherImgs(imgID, l, except) {
  for (let i = 0; i < l; i++) {
    if (i != except) {
      _(imgID + '_' + i).style.opacity = '0';
    } 
  }
}

function advanceImage(bgHolder, imgID, title, text, index, titSource, txtSource) {
  hideOtherImgs(imgID, titSource.length, index);
  _(imgID + '_' + index).style.opacity = '1';
  _(title).innerText = titSource[index];
  handleFade(title);
  _(text).innerText = txtSource[index];
  handleFade(text);
}

function changeIndex(type, index, mod) {
  if (type == 'left') {
    if (index < 1) {
      index = mod;
    } else {
      index--;
    }
  } else {
    index++;
    index %= mod;
  }
  return index;
}

// Custom print
let titleSources = ['Gyors prototípusgyártás FDM nyomtatással',
  'Tipikus felhasználási területek', 'Intelligens algoritmus, kényelmes vásárlás',
  'Kisszériás prototípusgyártás, egyedi rendelések'];
let textSources = [
  `A technológia kiváló választás lehet nullsorozatok gyártására a kész termék piacra dobása előtt. Így rengeteg időt és pénzt lehet megspórolni, ha még a termékfejlesztés korai szakaszában feltárulnak az esetleges hibák.`,
  `Gyakori felhasználási terület lehet épületek látványtervének a kinyomtatása vagy telefontokok, hétköznapi használati eszközök és alkatrészek prototípusának a gyors elkészítése. Kisszériás prototípusgyártás esetén így lehetőség nyílik a leendő felhasználók kezébe nyújtani egy tesztterméket.`,
  `Nincs szükség kapcsolatfelvételre, sem egyedi árajánlatra, ehelyett egyeszerűen csak töltsd fel a kinyomtatni kívánt STL fájlokat és igény szerint állítsd be a paramétereket. Az algoritmus azonnal ad egy árajánlatot, így feleslegessé téve a hosszas egyeztetést.`,
 `Kisszériás prototípusgyártás vagy egyedi megrendelés esetén lehetőség van a Prototípusgyártás oldalon a kapcsolatfelvételre és a további egyeztetésre.`
];

let cpSegment = new ImageSegment(_('cpLeftButton'), _('cpRightButton'), 0, titleSources, textSources);
cpSegment.attachHandlers(3, 'cpShow', 'cp', 'capTitle', 'scText');

// Lithophane
let titleSourcesLit = ['Kinyomtatott litofán és az eredeti kép', 'Hogyan működik?'];
let textSourcesLit = [
  `A kész litofán alapesetben egy nehezen kivehető, dombornyomott képed ad. Háttérvilágítással viszont kristálytisztán előtűnik maga a kép. A feltöltött digitális képből a 3D nyomtató készít egy valódi, tapintható litofánt, ami a technológiának köszönhetően valósághűen ábrázolja az eredeti képet.`,
  `A különböző vastagságú rétegek különböző mértékben engedik át a fényt és ezért tűnnek bizonyos részek sötétnek, mások pedig világosnak. A 3D nyomtató pontosságának köszönhetően a kinyomtatott litofánia élethűen adja vissza az eredeti képet.`,
];

let litSegment = new ImageSegment(_('litLeftButton'), _('litRightButton'), 0, titleSourcesLit, textSourcesLit);
litSegment.attachHandlers(1, 'litShow', 'lit', 'capTitleLit', 'scTextLit');

// FDM printer
let leftBtnFdm = _('fdmLeftButton');
let rightBtnFdm = _('fdmRightButton');
let currentIndexFdm = 0;
let titleSourcesFdm = ['FDM nyomtató', ' FDM Nyomtatáshoz szükséges filament'];
let textSourcesFdm = [
  `Az FDM nyomtatók precízen, a megolvadt filamentből, rétegről rétegre készítik el a kívánt modellt egy digitális fájlból. A nyomtató feje képes mindhárom tengelyen (X, Y, Z) mozogni, így szinte bármilyen alakzatot képes elkészíteni`,
  `Az FDM nyomtatók filamentet használnak nyomtatáshoz, ami egy magas hőmérsékleten (200 - 250 °C) olvadó anyag. A nyomtató az olvadt filamentből epíti fel a modellt, ami a lehűlés után használatra kész. A Zaccordon a hagyományos filament mellett lehetőség van rugalmas TPU-val is nyomtatni.`,
  `Az SLA nyomtatók a kívánt terméket fényre keményedő műgyanta alapanyagból állítják elő, ami a levilágítás helyén megszilárdul és így rétegről rétegre épül fel a végeredmény. Ezzel a technológiával sokkal pontosabb termékeket (50 mikron vagy alatta) lehet nyomtatni, viszont költségesebb és lassabb az FDM nyomtatásnál.`
];

let fdmSegment = new ImageSegment(_('fdmLeftButton'), _('fdmRightButton'), 0, titleSourcesFdm, textSourcesFdm);
fdmSegment.attachHandlers(1, 'fdmShow', 'fdm', 'capTitleFdm', 'scTextFdm');

// Filament materials
let titleSourcesMat = ['PLA filament', 'ABS filament', 'PETG filament', 'TPU filament'];
let textSourcesMat = [
  `A PLA egy keményítő alapú biopolimer, ami megújuló nyersanyagokból állítható elő, például kukoricából vagy cukornádból, ezáltal környezetbarát lesz. Magas szakítószilárdsággal és felületi minőséggel rendelkezik, ezáltal mind otthoni, mind irodai környezetben is alkalmazható. Olyan tárgyak létrehozását teszi lehetővé mint például háztartási eszközök, prototípusok készítése, játékok, bemutató tárgyak, építészeti modellek, valamint elveszett alkatrészek pótlása.`,
  `Az ABS nyomtatószál egy erős, a PLA -nál rugalmasabb, kevésbé törékeny, könnyen csiszolható és megmunkálható anyag, melyet old az aceton, így akár két darabot is egymáshoz lehet ragasztani vagy fényes felületet alkotni, azáltal, hogy acetonba, vagy aceton gőzbe mártjuk a megfelelő ideig modellünket (ekkor az apróbb részletek elveszhetnek).`,
  `A PETG egy erős és sokoldalú anyag, amely a hagyományos PET palack műanyagjának egy módosított változata. Egyesíti a PLA egyszerű használatát az ABS erősségével, hőállóságával és tartósságával. A PETG alkalmas nagy tárgyak nyomtatására is, mivel alig van vetemedése, továbbá ipari erősségű nyomtatószál, számos nagyszerű tulajdonsággal.`,
  `A TPU alapú rugalmas nyomtatószálak hőre lágyuló poliuretánok. A 3D nyomtatás világában a nyomtatószálakhoz használt standard műanyag az ABS és a PLA volt. Ennek a két filamentnek azonban nincs meg egy alapvető fizikai tulajdonsága - a rugalmasság. Számos prototípusnak vagy 3D-s nyomatnak hajlékonynak kell lennie, miközben megtartja az eredeti formai tényezőit.`
];

let matSegment = new ImageSegment(_('matLeftButton'), _('matRightButton'), 0, titleSourcesMat, textSourcesMat);
matSegment.attachHandlers(2, 'matShow', 'mat', 'capTitleMat', 'scTextMat');

// SLA printer
let titleSourcesSLA = ['SLA nyomtatás', 'Hogyan működik?', 'Miért válaszd az SLA-t?'];
let textSourcesSLA = [
  `A sztereolitográfia egy olyan 3D nyomtatási eljárás, amelyet koncepciómodellek, kozmetikai kellékek, gyors prototípusok és bonyolult geometriájú, összetett alkatrészek akár 1 nap alatt történő előállítására használnak. Az így készült alkatrészek az anyagok széles választékából állíthatók elő, segítségével rendkívül nagy felbontású részletek és minőségi felületek készíthetőek.`,
  `A gép a 3D nyomtatási folyamatot a tartószerkezetek rétegeinek, majd magának az alkatrésznek a megrajzolásával kezdi, egy folyékony, keményedő gyanta felületére irányított ultraibolya lézerrel. Miután egy réteget leképeztek a gyanta felületén, az építőplatform lefelé/felfelé tolódik, ezáltal lehetővé téve a következő gyantaréteg felvitelét. A folyamatot rétegről rétegre megismétli, amíg az építési folyamat be nem fejeződik.`,
  `Az SLA kiváló választás a gyors prototípusgyártáshoz és olyan projekttervekhez, amelyek nagyon pontos és finom részletességű alkatrészek gyártását igénylik. Ideális a koncepcióötletek validálását és az ergonómiai tesztelést lehetővé tevő, bemutató jellegű alkatrészek előállításához.`
];

let slaSegment = new ImageSegment(_('slaLeftButton'), _('slaRightButton'), 0, titleSourcesSLA, textSourcesSLA);
slaSegment.attachHandlers(2, 'slaShow', 'sla', 'capTitleSla', 'scTextSla');

