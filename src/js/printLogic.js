const useragent = require('express-useragent');
const util = require('util');
const buildBlogItem = require('./buildBlogsSection.js').buildBlogItem;
const constants = require('./includes/constants.js');
const LAZY_LOAD = constants.lazyLoad;
const PRINT_SIZES_PLA = constants.printSizesPLA;
const PRINT_SIZES_SLA = constants.printSizesSLA;
console.log(PRINT_SIZES_PLA, PRINT_SIZES_SLA)

// Custom printing for users if they have an .stl file
async function buildPrintSection(conn, req) {
  const query = util.promisify(conn.query).bind(conn);

  const rightArrow = `
    <svg class="contSvg blue">
      <svg>
      <path d="M9,1.5C4.8,1.5,1.5,4.8,1.5,9s3.3,7.5,7.5,7.5s7.5-3.3,7.5-7.5S13.2,1.5,9,1.5z M9,14.5l-1-1 l3.8-3.8H3.5V8.3h8.4L8.1,4.5L9,3.5L14.5,9L9,14.5z"></path>
      </svg>
    </svg>
  `;

  // Separately render the page for mobile & desktop versions
  let src = req.headers['user-agent'];
  let ua = useragent.parse(src);
  let isMobile = ua.isMobile;
  let dragDropText = isMobile ? 'Tölts fel fájlokat' : 'Húzd ide a fájlokat';
  let connWord = isMobile ? 'és' : 'vagy';

  // Select relevant blogs
  let res = await query('SELECT * FROM blog WHERE id IN (9, 10, 7)');

  // Build file upload form
  let output = `
    <section class="keepBottom flexDiv ofv" id="cprintHolder" style="padding-bottom: 0px;">
      <div class="flexDiv styleHolder" style="border-radius: 30px; width: 100%;">
        <div class="cPrintDivs leftDiv flexDiv" id="dropDiv" ondrop="dropFile(event)">
          <form action="/uploadPrint" enctype="multipart/form-data" method="post" id="fdz"
            style="margin-bottom: 10px;">
            <img src="/images/icons/ddupload.svg" width="90" height="90"
              style="margin: 0 auto;">
            <p class="gotham font24 dgray" style="margin-bottom: 15px;" id="dragdrop">
              ${dragDropText}
            </p> 
            <p class="gotham font18" style="margin-top: 0;" id="or">${connWord}</p>
            <div class="btnCommon fillBtn" id="fdzB" style="width: 60%; margin: 0 auto;
              max-width: 320px;">
              Böngéssz
            </div>
            <input type="file" name="file[]" style="display: none;" id="fileInput" multiple
              >
            <input type="submit" id="submitForm" style="display: none;">
            <br>
            <p class="gotham lh">
              Kérhetsz
              <a href="/print#getQuote" class="blueLink font16">egyedi árajánlatot</a>
              is, ha nincsen megfelelő fájlod nyomtatáshoz
            </p>
          </form>
        </div>
        <div class="cPrintDivs rightDiv flexDiv previews gotham" id="bigPrew">
          <div id="prew" class="lh">
            <p class="gotham font24" style="color: #2d2d2d; margin-top: 0;">
              3D nyomtatás fájlból
            </p> 
            <p class="gotham font18" style="color: #2d2d2d;">
              Nincsen kinyomtatni való fájlod?<br>
              <a class="blueLink" href="https://www.thingiverse.com" target="_blank">
                Nézz körul a Thingiversen!
              </a>
            </p> 

            <p class="gotham font16" style="color: #2d2d2d;">
              Litofániához képet, bérnyomtatáshoz STL fájlt tölts fel
            </p> 

            <p class="gotham font16 hideOnMobile" style="color: #2d2d2d;">
              <span class="gothamBold">Max. méret:</span> ${PRINT_SIZES_PLA[0]}mm x ${PRINT_SIZES_PLA[1]}mm x ${PRINT_SIZES_PLA[2]}mm (FDM)<br> ${PRINT_SIZES_SLA[0]}mm x ${PRINT_SIZES_SLA[1]}mm x ${PRINT_SIZES_SLA[2]}mm (SLA) 
            </p> 
          </div>
        </div>
      </div>
    </section>
  `;

  output += `
    <section class="keepBottom ofv" style="margin-top: 40px;">
      <div id="cpFadeHolder" style="opacity: 0;">
        <h1 class="gotham font26 align fontNorm">Precíz, gyors 3D bérnyomtatás azonnali megrendeléssel</h1>
        <h2 class="align font18 lh fontNorm">
          Megbízható FDM és SLA nyomtatás különféle színekben, akár rugalmas TPU-val is. A Zaccord
          megoldást nyújt a 3D nyomtatásban kevésbé jártas átlagemberek számára és a
          hozzáértőknek egyaránt.
        </h2>
        <p class="align">
          <a href="/printHelp" class="blueLink align">
            További információ
            ${rightArrow}
          </a>
          <span class="orSep">vagy</span>
          <a class="blueLink align jumpToPrint">
            Ugrás a nyomtatáshoz
            ${rightArrow}
          </a>
        </p>

        <div class="wideDynamicShowcase bgCommon" id="cpShow">
          <div class="wideHidden">
            <div class="noOflow">
              <div class="ctrlButtons trans" id="cpLeftButton">‹&nbsp;</div>
              <div class="ctrlButtons trans" id="cpRightButton">&nbsp;›</div>
            </div>
            <div class="normalOflow">
              <img src="/images/printShowcase/third.jpg" class="innerImg trans" id="cp_0">
              <img src="/images/printShowcase/second.jpg" class="innerImg trans" id="cp_1">
              <img src="/images/printShowcase/first.jpg" class="innerImg trans" id="cp_2">
              <img src="/images/printShowcase/fourth.jpg" class="innerImg trans" id="cp_3">
            </div>
          </div>
        </div>
        <h3 class="capitalTitle gothamMedium align fontNorm font16" id="capTitle">
          Gyors prototípusgyártás FDM nyomtatással
        </h3>
        <p id="scText" class="align lh" style="color: #3c4043;">A technológia kiváló választás lehet nullsorozatok
          gyártására a kész termék piacra dobása előtt. Így rengeteg időt és pénzt lehet megspórolni, ha még a
          termékfejlesztés korai szakaszában feltárulnak az esetleges hibák.
        </p>
      </div>

      <div id="infoFadeHolder" class="mtsix flowBox flexDiv flBoxSp flexWrap" style="opacity: 0;">
        <div>
          <h2 class="gotham font26 align fontNorm">Bérnyomtatás menete</h2>
          <h2 class="align font18 lh fontNorm">
            Ha rendelkezel a modell STL fájljával, akkor az
            <a class="jumpToPrint blueLink font18">oldalon</a> ezt fel tudod
            tölteni.
            Ellenkező esetben lehetőség van számos weboldalról letölteni előre
            elkészített tárgyak modelljét, ilyen például a népszerű és ingyenes
            <a class="font18 blueLink" href="https://www.thingiverse.com">Thingiverse</a>.
            <br><br>
            Ezután a feltöltött modell a böngészőben is megjelenik
            interaktív formában, ahol 3D-ben is megtekintheted a terméket. Itt
            lehetőség van különböző paraméterek beállítására is, viszont ha a
            tudásod hiányos e téren, érdemes lehet az alapbeállításokkal
            továbbhaladni. A legtöbb esetben ez megfelelő minőséget fog
            biztosítani.
            <br><br>
            Amenyiben eltérő fájlformátummal rendelkezel vagy egyedi megrendelést szeretnél leadni, akkor
            kérj személyre szabott árajánlatot az <a class="blueLink font18 goToQuote">oldal alján</a> vagy
            írj nekünk emailt az <a href="mailto:info@zaccord.com" class="blueLink font18">info@zaccord.com</a>
            címre.
          </h2>
        </div>
        <div>
          <div>
            <div class="flowImg bgCommon"></div>
          </div>
        </div>
      </div>
  `;

  output += `
    <div id="fdmFadeHolder" style="opacity: 0;">
      <h2 class="gotham font26 align fontNorm">FDM technológia</h2>
        <h2 class="align font18 lh fontNorm">
          Az FDM technológia jelenleg a legelterjettebb és legköltséghatákonyabb nyomtatási
          eljárás, rengeteg elérhető anyaggal és textúrával. Kiváló választás a végső termék piacra dobása előtti
          prototípusgyártásra.
        </h2>
        <p class="align">
          <a href="https://en.wikipedia.org/wiki/Fused_filament_fabrication" target="_blank" class="blueLink align">
            További információ
            ${rightArrow}
          </a>
          <span class="orSep">vagy</span>
          <a class="blueLink align jumpToPrint">
            Ugrás a nyomtatáshoz
            ${rightArrow}
          </a>
        </p>

        <div class="wideDynamicShowcaseFdm bgCommon trans" id="fdmShow">
          <div class="wideHidden">
            <div class="noOflow">
              <div class="ctrlButtons trans" id="fdmLeftButton">‹&nbsp;</div>
              <div class="ctrlButtons trans" id="fdmRightButton">&nbsp;›</div>
            </div>
            <div class="normalOflow">
              <img src="/images/printShowcase/fdmFirst.jpg" class="innerImg trans" id="fdm_0">
              <img src="/images/printShowcase/fdmSecond.jpg" class="innerImg trans" id="fdm_1">
              <img src="/images/printShowcase/slaPrinter.jpg" class="innerImg trans"
                id="fdm_2">
            </div>
          </div>
        </div>
        <h3 class="capitalTitle gothamMedium align font16 fontNorm" id="capTitleFdm">
          FDM nyomtató
        </h3>
        <p id="scTextFdm" class="align lh" style="color: #3c4043;">
            Az FDM nyomtatók precízen, a megolvadt filamentből, rétegről rétegre készítik
            el a kívánt modellt egy digitális fájlból. A nyomtató feje képes mindhárom
            tengelyen (X, Y, Z) mozogni, így szinte bármilyen alakzatot képes elkészíteni.
        </p>
      </div>
    </div>

    <div id="slaFadeHolder" style="opacity: 0;">
      <h2 class="gotham font26 align fontNorm">SLA technológia</h2>
        <h2 class="align font18 lh fontNorm">
          Az SLA technológia az FDM-nél sokkal pontosabb, viszont ezzel együtt drágább is. Gyakran használják orvosi és
          gyógyászati célokra, például fogsor prototípus nyomtatásához vagy anatómai modellezéshez,
          és apróbb modellek készítéséhez, ahol fontos a felületi minőség.
        </h2>
        <p class="align">
          <a href="https://en.wikipedia.org/wiki/Stereolithography" target="_blank" class="blueLink align">
            További információ
            ${rightArrow}
          </a>
          <span class="orSep">vagy</span>
          <a class="blueLink align jumpToPrint">
            Ugrás a nyomtatáshoz
            ${rightArrow}
          </a>
        </p>

        <div class="wideDynamicShowcaseFdm bgCommon trans" id="slaShow">
          <div class="wideHidden">
            <div class="noOflow">
              <div class="ctrlButtons trans" id="slaLeftButton">‹&nbsp;</div>
              <div class="ctrlButtons trans" id="slaRightButton">&nbsp;›</div>
            </div>
            <div class="normalOflow">
              <img src="/images/printShowcase/castle_sla.jpg" class="innerImg trans" id="sla_0">
              <img src="/images/printShowcase/slaPrinter.jpg" class="innerImg trans" id="sla_1">
              <img src="/images/printShowcase/house_sla.jpg" class="innerImg trans"
                id="sla_2">
            </div>
          </div>
        </div>
        <h3 class="capitalTitle gothamMedium align font16 fontNorm" id="capTitleSla">
          SLA nyomtatás
        </h3>
        <p id="scTextSla" class="align lh" style="color: #3c4043;">
          A sztereolitográfia egy olyan 3D nyomtatási eljárás, amelyet
          koncepciómodellek, kozmetikai kellékek, gyors prototípusok és
          bonyolult geometriájú, összetett alkatrészek akár 1 nap alatt történő
          előállítására használnak. Az így készült alkatrészek az anyagok széles választékából
          állíthatók elő, segítségével rendkívül nagy felbontású részletek és minőségi felületek készíthetőek. 
        </p>
      </div>
    </div>


    <div id="matFadeHolder">
      <h2 class="gotham font26 align fontNorm">FDM nyomtatási anyagok</h2>
        <h2 class="align font18 lh fontNorm">
          Különböző típusú FDM nyomtatásokhoz eltérő anyagokra lehet szükség, így annak
          érdekében hogy a specifikusabb igényeket is kielégítsük jelenleg a PLA, ABS, PETG és
          TPU anyagok mellett rengeteg más <a href="/colors" class="blueLink font18">anyag</a> is
          rendelkezésre áll. SLA nyomtatáshoz kizárólag UV resint használunk
          (különleges esetekben ennek egy adott  kategóriáját, például fogászati modellekhez).
        </h2>
        <p class="align">
          <a href="/materialHelp" class="blueLink align">
            További információ
            ${rightArrow}
          </a>
          <span class="orSep">vagy</span>
          <a class="blueLink align jumpToPrint">
            Ugrás a nyomtatáshoz
            ${rightArrow}
          </a>
        </p>

        <div class="wideDynamicShowcaseLit bgCommon trans" id="matShow">
          <div class="wideHidden">
            <div class="noOflow">
              <div class="ctrlButtons trans" id="matLeftButton">‹&nbsp;</div>
              <div class="ctrlButtons trans" id="matRightButton">&nbsp;›</div>
            </div>
            <div class="normalOflow">
              <img src="/images/printShowcase/matPLA.jpeg" class="innerImg trans" id="mat_0">
              <img src="/images/printShowcase/matABS.jpg" class="innerImg trans" id="mat_1">
              <img src="/images/printShowcase/matPETG.jpg" class="innerImg trans" id="mat_2">
              <img src="/images/printShowcase/matTPU.jpg" class="innerImg trans" id="mat_3">
            </div>
          </div>
        </div>
        <h3 class="capitalTitle gothamMedium align font16 fontNorm" id="capTitleMat">
          PLA filament
        </h3>
        <p id="scTextMat" class="align lh" style="color: #3c4043;">
          A PLA egy keményítő alapú biopolimer, ami megújuló nyersanyagokból állítható elő,
          például kukoricából vagy cukornádból, ezáltal környezetbarát lesz.
          Magas szakítószilárdsággal és felületi minőséggel rendelkezik, ezáltal mind
          otthoni, mind irodai környezetben is alkalmazható. Olyan tárgyak létrehozását teszi
          lehetővé mint például háztartási eszközök, prototípusok készítése, játékok,
          bemutató tárgyak, építészeti modellek, valamint elveszett alkatrészek pótlása. 
        </p>
      </div>
      
      <div class="mtsix">
        <h2 class="gotham font26 align fontNorm">Hasznos blogbejegyzések</h2>
        <h2 class="align font18 lh fontNorm">
          Gyakran frissülő blogbejegyzéseink hasznos információt nyújthatnak a kezdők és a 3D nyomtatásban jártas 
          emberek számára egyaránt. Ha szeretnél tovább olvasni a témában, akkor látogass el a
          <a class="font18 blueLink" href="/blogs">blog</a> oldalunkra további érdekes cikkekért.
        </h2>
        <div class="flexDiv flexWrap lh flSpAr">
    `;

    for (let currentBlog of Array.from(res)) {
      output += buildBlogItem(currentBlog);
    }

    output += `
      </div>
    </div>
    <div id="litFadeHolder">
      <h2 class="gotham font26 align fontNorm">Örökítsd meg legszebb képeidet 3D-ben!</h2>
        <h2 class="align font18 lh fontNorm">
          A legjobban sikerült képeidet litofánia formájában is kinyomtatjuk,
          így megörökítve a
          legszebb pillanataidat. Összesen egy képre van szükséged amit feltöltesz a Zaccordra
          és ezután azonnal megvásárolhatod a terméket.
        </h2>
        <p class="align">
          <a href="/lithophaneHelp" class="blueLink align">
            További információ
            ${rightArrow}
          </a>
          <span class="orSep">vagy</span>
          <a class="blueLink align jumpToPrint">
            Ugrás a nyomtatáshoz
            ${rightArrow}
          </a>
        </p>

        <div class="wideDynamicShowcaseLit bgCommon trans" id="litShow">
          <div class="wideHidden">
            <div class="noOflow">
              <div class="ctrlButtons trans" id="litLeftButton">‹&nbsp;</div>
              <div class="ctrlButtons trans" id="litRightButton">&nbsp;›</div>
            </div>
            <div class="normalOflow">
              <img src="/images/printShowcase/lit_one.png" class="innerImg trans" id="lit_0">
              <img src="/images/printShowcase/litSecond.jpg" class="innerImg trans" id="lit_1">
            </div>
          </div>
        </div>
        <h3 class="capitalTitle gothamMedium align fontNorm font16" id="capTitleLit">
          Kinyomtatott litofán és az eredeti kép
        </h3>
        <p id="scTextLit" class="align lh" style="color: #3c4043;">
          A kész litofán alapesetben egy nehezen kivehető,
          dombornyomott képed ad. Háttérvilágítással viszont kristálytisztán előtűnik maga a kép.
          A feltöltött digitális képből a 3D nyomtató készít egy valódi, tapintható litofánt,
          ami a technológiának köszönhetően valósághűen ábrázolja az eredeti képet.
        </p>
      </div>
      
      <div class="mtsix">
        <h2 class="gotham font26 align fontNorm" id="getQuote">
          Ajánlatkérés
        </h2>
        <h2 class="align font18 lh fontNorm">
          Amennyiben egyedi megrendelést szeretnél leadni vagy mást fájlformátumban vannak a nyomtatni kívánt
          modelljeid, akkor bátran vedd fel velünk a kapcsolatot egy ajánlatkérés formájában.
        </h2>
        <div class="flexDiv" style="flex-wrap: wrap;" id="normalDiv">
          <input type="text" class="dFormField" id="name" placeholder="Név" value="">
          <input type="email" class="dFormField" id="email" placeholder="Email">
          <input type="text" class="dFormField protmob" id="mobile"
            placeholder="Telefonszám" value="">
          <textarea placeholder="CAD modell URL, termékkel szembeni elvárások: anyag, szín, technológia stb."
            id="message" class="dFormField" style="width: 100%; height: 100px;"></textarea>
        </div>
        <button class="fillBtn btnCommon" id="submitBtn" style="display: block; margin: 0 auto;">
          Küldés
        </button>
        <div id="pstatus" class="align errorBox" style="margin-top: 20px;"></div>
        <div id="succstat" class="align successBox" style="margin-top: 20px;"></div>
      </div>

      <br>

      <hr class="hrStyle">

      <p class="align lh font18 notoSans">
        Sorozatgyártás vagy prototípusgyártás esetén látogass el a
        <a class="blueLink font18" href="/prototype">Prototípusgyártás</a> oldalra vagy
        vedd fel velünk a kapcsolatot a
        <a class="blueLink font18" href="mailto:info@zaccord.com">info@zaccord.com</a>
        email címen keresztül.
      <p>
    </section>
    ${LAZY_LOAD}
    <script src="/js/prototype.js" defer></script>
    <script src="/js/includes/statusFill.js"></script>
  `;

  return output;
}

module.exports = buildPrintSection;
