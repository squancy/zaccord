const constants = require('./includes/constants.js');
const REF_BG = constants.refBg;

const buildRefImage = (conn, id) => {
  return new Promise((resolve, reject) => {
    // First make sure a reference image with such an id exists in db
    let eQuery = 'SELECT * FROM reference_images WHERE id = ? LIMIT 1';
    conn.query(eQuery, [id], (err, result, field) => {
      if (err) {
        reject(err);
        return;
      } else if (result.length < 1) {
        // No such image in db, report error
        reject('Nincsen ilyen referencia kép');
        return;
      }

      // Image exists, now let's build the output
      let imgUrl = result[0].img_url;
      let title = result[0].title;
      let description = result[0].description;
      let rvas = result[0].rvas;
      let fvas = result[0].fvas;
      let infill = result[0].infill;
      let size = result[0].size;
      let sizeReadable = size.split(',').join('mm x ') + 'mm';
      let content = `
        <section class="keepBottom">
          <div class="refImgHolder"> 
            <img data-src="/images/referenceImages/${imgUrl}"
              src="${REF_BG}" class="brad lazy">
          </div>
          <div class="refInfoHolder">
            <p class="prodName refName">${title}</p>
            <p style="color: #696969" class="lh">${description}</p>
            <p><span class="gotham">Rétegvastagság:</span> ${rvas}mm</p>
            <p><span class="gotham">Falvastagság:</span> ${fvas}mm</p>
            <p><span class="gotham">Sűrűség:</span> ${infill}%</p>
            <p><span class="gotham">Méret:</span> ${sizeReadable}</p>
            <div class="downloadHolder gotham align blue trans" style="margin-top: 40px;">
              <a href="/images/referenceImages/${imgUrl}" download="${imgUrl}"class="blue">
                Letöltés
              </a>
            </div>
            <p class="align lh" style="margin-top: 40px;">
              Ha szeretnéd kinyomtatni a saját terméked, akkor válaszd a
              <a href="/print" class="blueLink font16">bérnyomtatás</a> funkciót vagy válogass
              <a href="/" class="blueLink font16">előre kinyomtatott</a> termékek között.
            </p>
          </div>
        </section>
        <script src="/js/includes/lazyLoad.js"></script>
        <script type="text/javascript">
          var lload = new LazyLoad({
            elements_selector: ".lazy"
          });
        </script>
      `; 
      resolve(content);
    });
  });
}

module.exports = buildRefImage;
