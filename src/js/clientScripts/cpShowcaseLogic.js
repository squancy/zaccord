// Implement the logic of the image showcase on the custom print page
const mq = window.matchMedia('(max-width: 1000px)');
if (mq.matches) {
  _('lit_0').src = '/images/printShowcase/litFirstMob.jpg';
  _('lit_1').src = '/images/printShowcase/litSecondMob.jpg';
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
let leftBtn = _('cpLeftButton');
let rightBtn = _('cpRightButton');
let currentIndex = 0;
let prefix = '../images/printShowcase/';
let ext = '.jpg';
let titleSources = ['Gyors prototípusgyártás FDM nyomtatással',
  'Tipikus felhasználási területek', 'Intelligens algoritmus, kényelmes vásárlás',
  'Kisszériás prototípusgyártás, egyedi rendelések'];
let textSources = [
  `A technológia kiváló választás lehet nullsorozatok gyártására a kész termék piacra dobása előtt. Így rengeteg időt és pénzt lehet megspórolni, ha még a termékfejlesztés korai szakaszában feltárulnak az esetleges hibák.`,
  `Gyakori felhasználási terület lehet épületek látványtervének a kinyomtatása vagy telefontokok, hétköznapi használati eszközök és alkatrészek prototípusának a gyors elkészítése. Kisszériás prototípusgyártás esetén így lehetőség nyílik a leendő felhasználók kezébe nyújtani egy tesztterméket.`,
  `Nincs szükség kapcsolatfelvételre, sem egyedi árajánlatra, ehelyett egyeszerűen csak töltsd fel a kinyomtatni kívánt STL fájlokat és igény szerint állítsd be a paramétereket. Az algoritmus azonnal ad egy árajánlatot, így feleslegessé téve a hosszas egyeztetést.`,
 `Kisszériás prototípusgyártás vagy egyedi megrendelés esetén lehetőség van a Prototípusgyártás oldalon a kapcsolatfelvételre és a további egyeztetésre.`
];



// Lithophane
let leftBtnLit = _('litLeftButton');
let rightBtnLit = _('litRightButton');
let currentIndexLit = 0;

let titleSourcesLit = ['Kinyomtatott litofán és az eredeti kép', 'Hogyan működik?'];
let textSourcesLit = [
  `A kész litofán alapesetben egy nehezen kivehető, dombornyomott képed ad. Háttérvilágítással viszont kristálytisztán előtűnik maga a kép. A feltöltött digitális képből a 3D nyomtató készít egy valódi, tapintható litofánt, ami a technológiának köszönhetően valósághűen ábrázolja az eredeti képet.`,
  `A külünböző vastagságú rétegek különböző mértékben engedik át a fényt és ezért tűnnek bizonyos részek sötétnek, mások pedig világosnak. A 3D nyomtató pontosságának köszönhetően a kinyomtatott litofánia élethűen adja vissza az eredeti képet.`,
];

// FDM printer
let leftBtnFdm = _('fdmLeftButton');
let rightBtnFdm = _('fdmRightButton');
let currentIndexFdm = 0;
let titleSourcesFdm = ['FDM nyomtató', ' FDM Nyomtatáshoz szükséges filament', 'SLA nyomtató'];
let textSourcesFdm = [
  `Az FDM nyomtatók precízen, a megolvadt filamentből, rétegről rétegre készítik el a kívánt modellt egy digitális fájlból. A nyomtató feje képes mindhárom tengelyen (X, Y, Z) mozogni, így szinte bármilyen alakzatot képes elkészíteni`,
  `Az FDM nyomtatók filamentet használnak nyomtatáshoz, ami egy magas hőmérsékleten (200 - 250 °C) olvadó anyag. A nyomtató az olvadt filamentből epíti fel a modellt, ami a lehűlés után használatra kész. A Zaccordon a hagyományos filament mellett lehetőség van rugalmas TPU-val is nyomtatni.`,
  `Az SLA nyomtatók a kívánt terméket fényre keményedő műgyanta alapanyagból állítják elő, ami a levilágítás helyén megszilárdul és így rétegről rétegre épül fel a végeredmény. Ezzel a technológiával sokkal pontosabb termékeket (50 mikron vagy alatta) lehet nyomtatni, viszont költségesebb és lassabb az FDM nyomtatásnál.`
];

// Filament materials
let leftBtnMat = _('matLeftButton');
let rightBtnMat = _('matRightButton');
let currentIndexMat = 0;
let titleSourcesMat = ['PLA filament', 'ABS filament', 'PETG filament', 'TPU filament'];
let textSourcesMat = [
  `A PLA egy keményítő alapú biopolimer, ami megújuló nyersanyagokból állítható elő, például kukoricából vagy cukornádból, ezáltal környezetbarát lesz. Magas szakítószilárdsággal és felületi minőséggel rendelkezik, ezáltal mind otthoni, mind irodai környezetben is alkalmazható. Olyan tárgyak létrehozását teszi lehetővé mint például háztartási eszközök, prototípusok készítése, játékok, bemutató tárgyak, építészeti modellek, valamint elveszett alkatrészek pótlása.`,
  `Az ABS nyomtatószál egy erős, a PLA -nál rugalmasabb, kevésbé törékeny, könnyen csiszolható és megmunkálható anyag, melyet old az aceton, így akár két darabot is egymáshoz lehet ragasztani vagy fényes felületet alkotni, azáltal, hogy acetonba, vagy aceton gőzbe mártjuk a megfelelő ideig modellünket (ekkor az apróbb részletek elveszhetnek).`,
  `A PETG egy erős és sokoldalú anyag, amely a hagyományos PET palack műanyagjának egy módosított változata. Egyesíti a PLA egyszerű használatát az ABS erősségével, hőállóságával és tartósságával. A PETG alkalmas nagy tárgyak nyomtatására is, mivel alig van vetemedése, továbbá ipari erősségű nyomtatószál, számos nagyszerű tulajdonsággal.`,
  `A TPU alapú rugalmas nyomtatószálak hőre lágyuló poliuretánok. A 3D nyomtatás világában a nyomtatószálakhoz használt standard műanyag az ABS és a PLA volt. Ennek a két filamentnek azonban nincs meg egy alapvető fizikai tulajdonsága - a rugalmasság. Számos prototípusnak vagy 3D-s nyomatnak hajlékonynak kell lennie, miközben megtartja az eredeti formai tényezőit.`
];

leftBtn.addEventListener('click', function prevImage(e) {
  currentIndex = changeIndex('left', currentIndex, 3);
  advanceImage('cpShow', 'cp', 'capTitle', 'scText', currentIndex, titleSources,
    textSources);
});

rightBtn.addEventListener('click', function nextImage(e) {
  currentIndex = changeIndex('right', currentIndex, 4);
  advanceImage('cpShow', 'cp', 'capTitle', 'scText', currentIndex, titleSources,
    textSources);
});

leftBtnLit.addEventListener('click', function prevImageLit(e) {
  currentIndexLit = changeIndex('left', currentIndexLit, 1);
  advanceImage('litShow', 'lit', 'capTitleLit', 'scTextLit', currentIndexLit,
    titleSourcesLit, textSourcesLit);
});

rightBtnLit.addEventListener('click', function nextImageLit(e) {
  currentIndexLit = changeIndex('right', currentIndexLit, 2);
  advanceImage('litShow', 'lit', 'capTitleLit', 'scTextLit', currentIndexLit,
    titleSourcesLit, textSourcesLit);
});

leftBtnFdm.addEventListener('click', function prevImageFdm(e) {
  currentIndexFdm = changeIndex('left', currentIndexFdm, 2);
  advanceImage('fdmShow', 'fdm', 'capTitleFdm', 'scTextFdm', currentIndexFdm,
    titleSourcesFdm, textSourcesFdm);
});

rightBtnFdm.addEventListener('click', function nextImageFdm(e) {
  currentIndexFdm = changeIndex('right', currentIndexFdm, 3);
  advanceImage('fdmShow', 'fdm', 'capTitleFdm', 'scTextFdm', currentIndexFdm,
    titleSourcesFdm, textSourcesFdm);
});

leftBtnMat.addEventListener('click', function prevImageMat(e) {
  currentIndexMat = changeIndex('left', currentIndexMat, 3);
  advanceImage('matShow', 'mat', 'capTitleMat', 'scTextMat', currentIndexMat,
    titleSourcesMat, textSourcesMat);
});

rightBtnMat.addEventListener('click', function nextImageMat(e) {
  currentIndexMat = changeIndex('right', currentIndexMat, 4);
  advanceImage('matShow', 'mat', 'capTitleMat', 'scTextMat', currentIndexMat,
    titleSourcesMat, textSourcesMat);
});
