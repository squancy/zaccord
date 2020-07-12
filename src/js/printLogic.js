// Custom printing for users if they have an .stl file
const buildMainSection = (conn) => {
  return new Promise((resolve, reject) => {
    let output = `
      <section class="keepBottom flexDiv" id="cprintHolder">     
    `; 

    // Build file upload form
    output += `
      <div class="flexDiv styleHolder" style="border-radius: 30px; width: 100%;">
      <div class="cPrintDivs leftDiv flexDiv" id="dropDiv" ondrop="dropFile(event)">
        <form action="/uploadPrint" enctype="multipart/form-data" method="post" id="fdz">
          <img src="/images/ddupload.png" width="90" style="margin: 0 auto;">
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
        <div id="prew">
          <p class="gotham font24" style="color: #2d2d2d;">Még nem töltöttél fel fájlokat</p> 
          <p class="gotham font18" style="color: #2d2d2d;">
            Nincsen kinyomtatni való fájlod?<br>
            <a class="blueLink" href="https://www.thingiverse.com">
              Nézz körul a Thingiversen!
            </a>
          </p> 

          <p class="gotham font18" style="color: #2d2d2d;">
            <a class="blueLink" href="/printHelp">Bérnyomtatás</a> &amp;
            <a class="blueLink" href="/lithophaneHelp">Litofánia</a>
            tudnivalók
          </p> 
        </div>
      </div>
      </div>
    `;

    output += '</section>';
    resolve(output);
  });
}

module.exports = buildMainSection;
