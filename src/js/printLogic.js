// Custom printing for users if they have an .stl file
const buildMainSection = (conn) => {
  return new Promise((resolve, reject) => {
    // Build file upload form
    let output = `
      <section class="keepBottom flexDiv" id="cprintHolder" style="padding-bottom: 0px;">
        <div class="flexDiv styleHolder" style="border-radius: 30px; width: 100%;">
          <div class="cPrintDivs leftDiv flexDiv" id="dropDiv" ondrop="dropFile(event)">
            <form action="/uploadPrint" enctype="multipart/form-data" method="post" id="fdz"
              style="margin-bottom: 10px;">
              <img src="/images/icons/ddupload.svg" width="90" height="90"
                style="margin: 0 auto;">
              <p class="gotham font24 dgray" style="margin-bottom: 15px;" id="dragdrop">
                Húzd ide a fájlokat
              </p> 
              <p class="gotham font18" style="margin-top: 0;" id="or">vagy</p>
              <div class="btnCommon fillBtn" id="fdzB" style="width: 60%; margin: 0 auto;
                max-width: 320px;">
                Böngéssz
              </div>
              <input type="file" name="file[]" style="display: none;" id="fileInput" multiple
                accept="image/png,image/jpg,.stl">
              <input type="submit" id="submitForm" style="display: none;">
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
                A modell x, y és z paraméterei maximum 220mm lehetnek
              </p> 
            </div>
          </div>
        </div>
      </section>
    `;

    output += `
      <section class="keepBottom" style="margin-top: 40px;">
        <div id="cpFadeHolder" style="opacity: 0;">
          <p class="gotham font26 align">Precíz, gyors 3D bérnyomtatás azonnali megrendeléssel</p>
          <p class="align font18 lh">
            Megbízható FDM és SLA nyomtatás különféle színekben, akár rugalmas TPU-val is. A Zaccord
            megoldást nyújt a 3D nyomtatásban kevésbé jártas átlagemberek számára és a
            hozzáértőknek egyaránt.
          </p>
          <p class="align">
            <a href="/printHelp" class="blueLink align">
              További információ
              <svg class="contSvg blue">
                <svg>
                  <path d="M9,1.5C4.8,1.5,1.5,4.8,1.5,9s3.3,7.5,7.5,7.5s7.5-3.3,7.5-7.5S13.2,1.5,9,1.5z M9,14.5l-1-1 l3.8-3.8H3.5V8.3h8.4L8.1,4.5L9,3.5L14.5,9L9,14.5z"></path>
                </svg>
              </svg>
            </a>
            <span class="orSep">vagy</span>
            <a class="blueLink align jumpToPrint">
              Ugrás a nyomtatáshoz
              <svg class="contSvg blue">
                <svg>
                  <path d="M9,1.5C4.8,1.5,1.5,4.8,1.5,9s3.3,7.5,7.5,7.5s7.5-3.3,7.5-7.5S13.2,1.5,9,1.5z M9,14.5l-1-1 l3.8-3.8H3.5V8.3h8.4L8.1,4.5L9,3.5L14.5,9L9,14.5z"></path>
                </svg>
              </svg>
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
          <p class="capitalTitle gothamMedium align" id="capTitle">Gyors prototípusgyártás FDM nyomtatással</p>
          <p id="scText" class="align lh" style="color: #3c4043;">A technológia kiváló választás lehet nullsorozatok
            gyártására a kész termék piacra dobása előtt. Így rengeteg időt és pénzt lehet megspórolni, ha még a
            termékfejlesztés korai szakaszában feltárulnak az esetleges hibák.
          </p>
    `;

    output += `
      <div id="fdmFadeHolder" style="opacity: 0;">
        <p class="gotham font26 align">FDM és SLA technológia</p>
          <p class="align font18 lh">
            A Zaccordról kizárólag FDM és SLA technológiával készült termékeket
            lehet rendelni. Az FDM jelenleg a legelterjettebb és legköltséghatákonyabb nyomtatási
            eljárás, míg az SLA eljárással készült termékek sokkal pontosabbak, minőségük a
            fröccsöntött műanyagéval vetekszik.
          </p>
          <p class="align">
            <a href="https://en.wikipedia.org/wiki/Fused_filament_fabrication" target="_blank" class="blueLink align">
              További információ
              <svg class="contSvg blue">
                <svg>
                  <path d="M9,1.5C4.8,1.5,1.5,4.8,1.5,9s3.3,7.5,7.5,7.5s7.5-3.3,7.5-7.5S13.2,1.5,9,1.5z M9,14.5l-1-1 l3.8-3.8H3.5V8.3h8.4L8.1,4.5L9,3.5L14.5,9L9,14.5z"></path>
                </svg>
              </svg>
            </a>
            <span class="orSep">vagy</span>
            <a class="blueLink align jumpToPrint">
              Ugrás a nyomtatáshoz
              <svg class="contSvg blue">
                <svg>
                  <path d="M9,1.5C4.8,1.5,1.5,4.8,1.5,9s3.3,7.5,7.5,7.5s7.5-3.3,7.5-7.5S13.2,1.5,9,1.5z M9,14.5l-1-1 l3.8-3.8H3.5V8.3h8.4L8.1,4.5L9,3.5L14.5,9L9,14.5z"></path>
                </svg>
              </svg>
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
          <p class="capitalTitle gothamMedium align" id="capTitleFdm">
            FDM nyomtató
          </p>
          <p id="scTextFdm" class="align lh" style="color: #3c4043;">
              Az FDM nyomtatók precízen, a megolvadt filamentből, rétegről rétegre készítik
              el a kívánt modellt egy digitális fájlból. A nyomtató feje képes mindhárom
              tengelyen (X, Y, Z) mozogni, így szinte bármilyen alakzatot képes elkészíteni.
          </p>
        </div>
      </div>

      <div id="matFadeHolder">
        <p class="gotham font26 align">FDM Nyomtatási anyagok</p>
          <p class="align font18 lh">
            Különböző típusú FDM nyomtatásokhoz eltérő anyagokra lehet szükség, így annak
            érdekében hogy a specifikusabb igényeket is kielégítsük jelenleg PLA, ABS, PETG és
            TPU típusú anyagokkal lehet nyomtatni. SLA nyomtatáshoz kizárólag UV resint
            használunk.
          </p>
          <p class="align">
            <a href="/materialHelp" class="blueLink align">
              További információ
              <svg class="contSvg blue">
                <svg>
                  <path d="M9,1.5C4.8,1.5,1.5,4.8,1.5,9s3.3,7.5,7.5,7.5s7.5-3.3,7.5-7.5S13.2,1.5,9,1.5z M9,14.5l-1-1 l3.8-3.8H3.5V8.3h8.4L8.1,4.5L9,3.5L14.5,9L9,14.5z"></path>
                </svg>
              </svg>
            </a>
            <span class="orSep">vagy</span>
            <a class="blueLink align jumpToPrint">
              Ugrás a nyomtatáshoz
              <svg class="contSvg blue">
                <svg>
                  <path d="M9,1.5C4.8,1.5,1.5,4.8,1.5,9s3.3,7.5,7.5,7.5s7.5-3.3,7.5-7.5S13.2,1.5,9,1.5z M9,14.5l-1-1 l3.8-3.8H3.5V8.3h8.4L8.1,4.5L9,3.5L14.5,9L9,14.5z"></path>
                </svg>
              </svg>
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
          <p class="capitalTitle gothamMedium align" id="capTitleMat">
            PLA filament
          </p>
          <p id="scTextMat" class="align lh" style="color: #3c4043;">
            A PLA egy keményítő alapú biopolimer, ami megújuló nyersanyagokból állítható elő,
            például kukoricából vagy cukornádból, ezáltal környezetbarát lesz.
            Magas szakítószilárdsággal és felületi minőséggel rendelkezik, ezáltal mind
            otthoni, mind irodai környezetben is alkalmazható. Olyan tárgyak létrehozását teszi
            lehetővé mint például háztartási eszközök, prototípusok készítése, játékok,
            bemutató tárgyak, építészeti modellek, valamint elveszett alkatrészek pótlása. 
          </p>
        </div>


      <div id="litFadeHolder">
        <p class="gotham font26 align">Örökítsd meg legszebb képeidet 3D-ben!</p>
          <p class="align font18 lh">
            A legjobban sikerült képeidet litofánia formájában is kinyomtatjuk,
            így megörökítve a
            legszebb pillanataidat. Összesen egy képre van szükséged amit feltöltesz a Zaccordra
            és ezután azonnal megvásárolhatod a terméket.
          </p>
          <p class="align">
            <a href="/lithophaneHelp" class="blueLink align">
              További információ
              <svg class="contSvg blue">
                <svg>
                  <path d="M9,1.5C4.8,1.5,1.5,4.8,1.5,9s3.3,7.5,7.5,7.5s7.5-3.3,7.5-7.5S13.2,1.5,9,1.5z M9,14.5l-1-1 l3.8-3.8H3.5V8.3h8.4L8.1,4.5L9,3.5L14.5,9L9,14.5z"></path>
                </svg>
              </svg>
            </a>
            <span class="orSep">vagy</span>
            <a class="blueLink align jumpToPrint">
              Ugrás a nyomtatáshoz
              <svg class="contSvg blue">
                <svg>
                  <path d="M9,1.5C4.8,1.5,1.5,4.8,1.5,9s3.3,7.5,7.5,7.5s7.5-3.3,7.5-7.5S13.2,1.5,9,1.5z M9,14.5l-1-1 l3.8-3.8H3.5V8.3h8.4L8.1,4.5L9,3.5L14.5,9L9,14.5z"></path>
                </svg>
              </svg>
            </a>
          </p>

          <div class="wideDynamicShowcaseLit bgCommon trans" id="litShow">
            <div class="wideHidden">
              <div class="noOflow">
                <div class="ctrlButtons trans" id="litLeftButton">‹&nbsp;</div>
                <div class="ctrlButtons trans" id="litRightButton">&nbsp;›</div>
              </div>
              <div class="normalOflow">
                <img src="/images/printShowcase/litFirst.jpg" class="innerImg trans" id="lit_0">
                <img src="/images/printShowcase/litSecond.jpg" class="innerImg trans" id="lit_1">
              </div>
            </div>
          </div>
          <p class="capitalTitle gothamMedium align" id="capTitleLit">
            Kinyomtatott litofán és az eredeti kép
          </p>
          <p id="scTextLit" class="align lh" style="color: #3c4043;">
            A kész litofán alapesetben egy nehezen kivehető,
            dombornyomott képed ad. Háttérvilágítással viszont kristálytisztán előtűnik maga a kép.
            A feltöltött digitális képből a 3D nyomtató készít egy valódi, tapintható litofánt,
            ami a technológiának köszönhetően valósághűen ábrázolja az eredeti képet.
          </p>
        </div>

        <p class="align lh" style="margin-top: 40px;">
          Egyedi nyomtatás vagy prototípusgyártás esetén látogass el a
          <a class="blueLink font16" href="/prototype">Prototípusgyártás</a> oldalra vagy
          vedd fel velünk a kapcsolatot a
          <a class="blueLink font16" href="mailto:info@zaccord.com">info@zaccord.com</a>
          email címen keresztül.
        <p>
      </section>
    `;
    resolve(output);
  });
}

module.exports = buildMainSection;
