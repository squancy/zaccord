// Custom printing for users if they have an .stl file
const buildMainSection = (conn) => {
  return new Promise((resolve, reject) => {
    let output = `
      <section class="keepBottom">     
    `; 

    // Build file upload form
    output += `
      <form action="/uploadPrint" enctype="multipart/form-data" method="post">
        <input type="file" name="customPrint" id="file-5" class="inputfile inputfile-4"
          data-multiple-caption="{count} fájl kiválasztva" style="display: none"
          accept=".stl" multiple/>
        <label for="file-5">
          <figure>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="17" viewBox="0 0 20 17">
              <path d="M10 0l-5.2 4.9h3.3v5.1h3.8v-5.1h3.3l-5.2-4.9zm9.3 11.5l-3.2-2.1h-2l3.4 2.6h-3.5c-.1 0-.2.1-.2.1l-.8 2.3h-6l-.8-2.2c-.1-.1-.1-.2-.2-.2h-3.6l3.4-2.6h-2l-3.2 2.1c-.4.3-.7 1-.6 1.5l.6 3.1c.1.5.7.9 1.2.9h16.3c.6 0 1.1-.4 1.3-.9l.6-3.1c.1-.5-.2-1.2-.7-1.5z"/></svg>
          </figure>
          <span style="text-align: center; display: block;">
            Válassz a fájlok közül&hellip;
          </span>
        </label>
        <div class="flexDiv" style="word-spacing: 10px;">
          <div>
            <input type="submit" class="btnCommon fillBtn" style="margin: auto;
              margin-top: 20px;" value="Feltöltés"> <span> vagy
              <a href="https://www.thingiverse.com/" class="blueLink">Thingiverse</a></span>
           </div>
        </div>
      </form>
      <p class="align">
        <a href="/printHelp" class="blueLink">Segítség a bérnyomtatáshoz</a>
      </p>
      <p class="align note">
        <span class="blue">Megjegyzés:</span> egyszerre maximum 10db fájl tölthető fel és egy
        fájl mérete maximum 20MB lehet!
      </p>
    `;

    output += '</section>';
    resolve(output);
  });
}

module.exports = buildMainSection;
