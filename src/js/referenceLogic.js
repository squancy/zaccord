const constants = require('./includes/constants.js');
const NUM_OF_COLS = constants.numOfCols;
const NUM_OF_IMGS = constants.numOfImgs;

const buildReferencePage = (conn) => {
  return new Promise((resolve, reject) => {
    // First gather the photos from db
    let iQuery = 'SELECT * FROM reference_images';
    conn.query(iQuery, (err, result, fields) => {
      if (err) {
        reject('Problem during reference image fetch from database');
        return;
      }

      let content = `
        <section class="keepBottom">
          <div class="row">  
      `;
      
      let initial = 0;
      for (let i = 0; i < NUM_OF_COLS; i++) {
        content += '<div class="column">';
        if (initial + NUM_OF_IMGS > result.length) {
          var upperLimit = result.length;
        } else {
          var upperLimit = initial + NUM_OF_IMGS;
        }

        for (let j = initial; j < upperLimit; j++) {
          let id = result[j].id;
          let imgUrl = result[j].img_url;
          let title = result[j].title;
          let description = result[j].description;

          content += `
            <div class="refCont">
              <img src="/images/referenceImages/${imgUrl}" style="width: 100%;" class="trans"
                onclick="window.location.href = '/refImage?id=${id}'">
              <a href="/images/referenceImages/${imgUrl}" download="${imgUrl}">
                <div class="refDownload trans">
                  <img src="/images/icons/download.png">
                </div>
              </a>
              <p class="gotham align">${title}</p>
            </div>
          `;
          if (j == upperLimit - 1) initial = upperLimit;
        }
        content += '</div>';
      }

      content += `
          </div>
        </section>
      `;

      resolve(content);
    });
  })
}

module.exports = buildReferencePage;

