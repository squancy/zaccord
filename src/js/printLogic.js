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
              <div class="btnCommon fillBtn" id="fdzB" style="width: 60%; margin: 0 auto;">
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
          <p class="gotham font26 align">Már megvan a 3D-s modell? Mi kinyomtatjuk neked!</p>
          <p class="align font18 lh">
            Csak egy STL fájlra van szükséged és azonnal meg is rendelheted a kívánt terméket.
            A 3D nyomtatás kínálta lehetőségek közel végtelenek, így bármit kinyomtatunk neked
            ami belefér egy 20cm x 20cm x 20cm nagyságú kockába.
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
          <div class="flexDiv cpInfo lh">
            <div class="align">
              <div class="cpInfoImg bgCommon" id="cpInfoImg1"></div>
              <p class="gothamMedium">Tervezd meg a saját modelledet</p>
              <p>
                Bármilyen programmal megtervezheted a modellt, vagy ha nem szeretnél erre időt
                áldozni, akkor látogass el a
                <a href="https://www.thingiverse.com" class="blueLink font16">Thingiversre</a>
                ahol rengeteg ingyenes modellt tölthetsz le.
              </p>
            </div>
            <div class="align">
              <div class="cpInfoImg bgCommon" id="cpInfoImg2"></div>
              <p class="gothamMedium">Mi kinyomtatjuk neked</p>
              <p>
                Miután megvan az STL fájl már csak fel kell töltened a Zaccordra és már meg is
                vásárolhatod a terméket. Nincs szükség kapcsolatfelvételre vagy árajánlatra, az
                algoritmus mindent elvégez helyetted.
              </p>
            </div>
          </div>
        </div> 

        <div id="litFadeHolder">
          <p class="gotham font26 align" style="margin-top: 0;">
            Örökítsd meg legszebb képeidet 3D-ben!
          </p>
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


          <div class="flexDiv cpInfo lh">
            <div class="align">
              <div class="cpInfoImg bgCommon" id="cpInfoImg3"></div>
              <p class="gothamMedium">Kinyomtatott litofánia</p>
              <p>
                A kész litofánia alapesetben egy nehezen kivehető, dombornyomott képed ad.
                Háttérvilágítással viszont kristálytisztán előtűnik maga a kép.
              </p>
            </div>
            <div class="align">
              <div class="cpInfoImg bgCommon" id="cpInfoImg4"></div>
              <p class="gothamMedium">Eredeti kép</p>
              <p>
                A külünböző vastagságú rétegek különböző mértékben
                engedik át a fényt és ezért tűnnek bizonyos részek sötétnek, mások pedig
                világosnak.
              </p>
            </div>
          </div>
        </div>


        <div id="fdmFadeHolder" style="opacity: 0;">
          <p class="gotham font26 align">FDM (szálhúzásos) technológia</p>
          <p class="align font18 lh">
            A Zaccordról kizárólag FDM (szálhúzásos) technológiával készült termékeket
            lehet vásárolni. Jelenleg ez a legelterjettebb és legköltséghatákonyabb nyomtatási
            eljárás. Egyetlen hátránya, hogy nagyon apró vagy túlzottan részletes modellek
            nyomtatására kevésbé alkalmas.
          </p>
          <p class="align">
            <a href="https://en.wikipedia.org/wiki/Fused_filament_fabrication" target="_blank"
              class="blueLink align">
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
          <div class="flexDiv cpInfo lh">
            <div class="align">
              <div class="cpInfoImg bgCommon" id="cpInfoImg5"></div>
              <p class="gothamMedium">Nyomtatáshoz szükséges filament</p>
              <p>
                Az FDM nyomtatók filamentet használnak nyomtatáshoz, ami egy magas
                hőmérsékleten (200 - 250 &deg;C) olvadó anyag. A nyomtató az olvadt filamentből
                epíti fel a modellt, ami a lehűlés után használatra kész.
              </p>
            </div>
            <div class="align">
              <div class="cpInfoImg bgCommon" id="cpInfoImg6"></div>
              <p class="gothamMedium">FDM nyomtató</p>
              <p>
                Az FDM nyomtatók precízen, a megolvadt filamentből, rétegről rétegre készítik
                el a kívánt modellt egy digitális fájlból. A nyomtató feje képes mindhárom
                tengelyen (X, Y, Z) mozogni, így szinte bármilyen alakzatot képes elkészíteni.
              </p>
            </div>
          </div>
        </div>
        <p class="align lh">
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
