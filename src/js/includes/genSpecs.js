const constants = require('./specParams.js');
const LAYER_WIDTH_VALUES = constants.layerHeight;
const INFILL_VALUES = constants.infill;
const SCALE_VALUES = constants.scale;
const WALL_WIDTH_VALUES = constants.wallWidth;
const LAYER_WIDTH_VALUES_SLA = constants.layerHeightSLA;
const INFILL_VALUES_SLA = constants.infillSLA;
const getColors = require('./getColors.js');

// Generate a form where the user can change the item's parameters
function genSpecs(conn, price, size, isLit = false, isCP = false) {
  return new Promise((resolve, reject) => {
    getColors(conn).then(([colors, hex_codes]) => {
      const PRINT_COLORS = colors;
      const PRINT_MATERIALS = Object.keys(colors).map(e => e.toUpperCase()).filter(e => e != 'GYANTA (RESIN)');
      let output = '';
      if (!isLit) {
        output += `
          <hr class="hrStyle">
            <div class="itemSpecifications animate__animated" id="toggleDiv">
              <div class="specBox gotham">
                <div id="rvasFDMBox">
                  <div class="specTitle">Rétegvastagság</div>
                  <select class="specSelect" id="rvas" onchange="updateSpecs(this, ${price}, false,
                    false, ${isCP})">
        `;

        for (let lw of LAYER_WIDTH_VALUES) {
          let selected = lw == 0.2 ? 'selected' : '';
          output += `
            <option value="${lw.toFixed(2)}" ${selected}>${lw.toFixed(2)}mm</option>
          `;
        }

        output += `
                  </select>
                </div>
                <div class="SLASpecs" id="rvasSLABox">
                  <div class="specTitle">Rétegvastagság</div>
                    <select class="specSelect" id="rvasSLA"
                      onchange="updateSLASpecs('rvasSLA', 'rvas')">
        `;

        for (let lw of LAYER_WIDTH_VALUES_SLA) {
          let selected = lw == 0.05 ? 'selected' : '';
          output += `
            <option value="${lw.toFixed(2)}" ${selected}>${lw.toFixed(2)}mm</option>
          `; 
        } 

        output += `
                  </select>
                </div>
                <div class="SLASpecs" id="infillSLABox">
                  <div class="specTitle">Sűrűség</div>
                    <select class="specSelect" id="infillSLA"
                      onchange="updateSLASpecs('infillSLA', 'suruseg')">
        `;
        
        for (let infill of INFILL_VALUES_SLA) {
          let selected = infill == 'Tömör' ? 'selected' : '';
          output += `
            <option value="${infill}" ${selected}>${infill}</option>
          `;
        }

        output += `
                  </select>
                </div>
                <div id="surusegFDMBox">
                  <div class="specTitle trans">Sűrűség</div>
                    <select class="specSelect" id="suruseg" onchange="updateSpecs(this, ${price},
                    false, false, ${isCP})">
        `;

        for (let infill of INFILL_VALUES) {
          let selected = infill == 20 ? 'selected' : '';
          output += `
            <option value="${infill}" ${selected}>${infill}%</option>
          `;
        }

        output += `
                  </select>
                </div>
                
                <div>
                  <div class="specTitle">
                    <a href="/colors" class="trans colorLink">Szín</a>
                    <img src="/images/icons/external.png" id="goToColor">
                  </div>
                  <select class="specSelect" id="color">
        `;
        
        for (let c of PRINT_COLORS['pla']) {
          let selected = c == 'Fehér' ? 'selected' : '';
          output += `
            <option value="${c}" ${selected}>${c}</option>
          `;
        }

        output += `          
                  </select>
                </div>

                <div>
                  <div class="specTitle">Méretezés</div>
                  <select class="specSelect" id="scale"
                    onchange="updateScale(this, ${price}, '${size}')">
        `;

        for (let scale of SCALE_VALUES) {
          let selected = scale == 1 ? 'selected' : '';
          output += `
            <option value="${scale.toFixed(1)}" ${selected}>x${scale.toFixed(1)}</option>
          `; 
        }

        output += `
                  </select>
                </div>

                <div id="fvasFDMBox">
                  <div class="specTitle">Falvastagság</div>
                  <select class="specSelect" id="fvas" onchange="updateSpecs(this, ${price}, false,
                  false, ${isCP})">
        `;

        for (let ww of WALL_WIDTH_VALUES) {
          let selected = ww.toFixed(2) == 1.2 ? 'selected' : '';
          output += `
            <option value="${ww.toFixed(1)}" ${selected}>${ww.toFixed(1)}mm</option>
          `;
        }

        output += `
                </select>
              </div>
        `;

        if (isCP) {
          output += `
            <div id="printMatBox">
              <div class="specTitle">Nyomtatás Anyaga</div>
              <select class="specSelect" id="printMat" onchange="updateSpecs(this, ${price}, false,
                false, ${isCP})">
          `;
          
          for (let pm of PRINT_MATERIALS) {
            output += `<option value="${pm}">${pm}</option>`;
          }

          output += `
              </select>
            </div>
          `;
        }

        output += `
            </div>
          </div>
          `;

      } else {
        output += `
          <hr class="hrStyle">
          <div class="itemSpecifications">
          <div class="specBox gotham">
          <div>
          <div class="specTitle">Forma</div>
          <select class="specSelect" id="sphere">
          <option value="Domború" selected>Domború</option>
              <option value="Homorú">Homorú</option>
              <option value="Sima">Sima</option>
            </select>
          </div>

          <div>
            <div class="specTitle">Méret</div>
            <select class="specSelect" id="size" onchange="updateLit()">
            </select>
          </div>
          <div>
            <div class="specTitle">Szín</div>
            <select class="specSelect" id="color">
        `;

        for (let c of PRINT_COLORS['pla']) {
          let selected = c == 'Fehér' ? 'selected' : '';
          output += `
            <option value="${c}" ${selected}>${c}</option>
          `;
        }

        output += `
                  </select>
                </div>
              </div>
            </div>
          </div>
        `;     

      }

      resolve(output);
    });
  });
}

module.exports = genSpecs;
