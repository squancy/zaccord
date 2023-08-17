const buildColors = (conn) => {
  const furtherInfo = `
    További információt a <a class="blueLink font16" href="/materialHelp">Nyomtatási Anyagok</a> oldalon és a
    <a class="blueLink font16" href="https://www.3djake.hu">beszállító</a> oldalán találsz.
  `;

  const desc = [
    `A népszerű, sokoldalú, standrad FDM nyomtatási anyag számos színben és textúrában.`,
    `Egyszerűen használható nyomtatási anyag, a PLA-nál erősebb, hőállóbb és tartósabb.`,
    `Könnyen csiszolható és megmunkálható, a felületét acetonnal lehet kezelni a sima felület elérése végett.`,
    `Rugalmas és erős nyomtatási anyag, amely megtartja az eredeti formát és alakot.`,
    `Az ABS-hez hasonló anyag, viszont attól szebb nyomatot eredményez, emellett UV-fény álló is.`,
    'Fa részecskék és PLA keveréke, ami nyomtatás után élethű fa hatást eredményez.',
    'Fémforgács és PLA keveréke, ami nyomtatás után élethű fém hatást eredményez.',
    'Kőzet részecskék és PLA keveréke, ami nyomtatás után élethű kőzetes hatást eredményez.',
    'Színátmenetes PLA anyagok, így egy modellen belül több szín is alkalmazható.',
    'Az SLA technológiájú nyomtatók standard alapanyaga.',
    'Rugalmas és erős nyomtatási anyag, amely megtartja az eredeti formát és alakot.',
    'Rugalmas és erős nyomtatási anyag, amely megtartja az eredeti formát és alakot.',
    'Magas olvadáspontú, nagy szakítószilárdságú és erős anyag ipari alkalmazásra, funkcionális alkatrészekhez.',
    'Szénszálas, erős és tartós anyag ipari alkalmazásra.'
  ];

  return new Promise((resolve, reject) => {
    let colorQuery = 'SELECT DISTINCT material FROM colors';
    let promises = [];
    let content = `<section class="keepBottom lh" style="overflow: visible;">`;
    conn.query(colorQuery, [], (err, result, field) => {
      if (err) {
        reject(err);
        return;
      }

      let materials = [];
      for (let i = 0; i < result.length; i++) {
        materials.push(result[i].material);
      }
      
      for (let i = 0; i < materials.length; i++) {
        let currentMaterial = materials[i];
        let currentDesc = desc[i] + furtherInfo;
        let promise = new Promise((resolve, reject) => {
          let matQuery = 'SELECT * FROM colors WHERE material = ? ORDER BY color';
          conn.query(matQuery, [currentMaterial], (err, result, field) => {
            if (err) {
              reject(err);
              return;
            } else {
              let filamentsText = currentMaterial == 'gyanta (resin)' ? '' : 'Filamentek';
              let filamentText = currentMaterial == 'gyanta (resin)' ? '' : 'Filament';
              let output = `
                <h2 class="fontNorm gotham ${i == 0 ? 'mtz' : 'mtf'}">
                  ${currentMaterial.toUpperCase()} ${filamentsText}
                </h2>
                <p>${currentDesc}</p>
                <div class="flexDiv flexWrap">
              `;

              for (let i = 0; i < result.length; i++) {
                let imgPath = result[i].images.split(',')[0];
                let colorName = result[i].color;
                let inStock = result[i].in_stock;
                let info = result[i].info;
                let stockClass = inStock ? 'inStock' : 'notInStock';
                let stockText = inStock ? 'Raktáron' : 'Nincs raktáron';
                output += `
                  <span id="${colorName}_${currentMaterial.toUpperCase()}"></span>
                  <div class="colorBox trans">
                    <div>
                      <img src="/images/colors/${imgPath}">
                    </div>
                    
                    <div>
                      <p class="gotham">${colorName} ${currentMaterial.toUpperCase()} ${filamentText}</p>
                      <p class="gothamNormal">${info}</p>
                      <p class="${stockClass} gothamNormal">${stockText}</p>
                    </div>
                  </div>
                `;  
              } 
              output += '</div>';
              resolve(output);
            }
          });
        });
        promises.push(promise);
      }

      Promise.all(promises).then(values => {
        for (let v of values) {
          content += v;
        }

        content += `
          </section>
        `;

        resolve(content);
      });
    });
  });
}

module.exports = buildColors;
