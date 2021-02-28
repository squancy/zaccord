const constants = require('./constants.js');
const PRINT_COLORS = constants.printColors;
const PRINT_MATERIALS = constants.printMaterials;

// Generate a form where the user can change the item's parameters
function genSpecs(price, size, isLit = false, isCP = false) {
  if (!isLit) {
    let output = `
      <hr class="hrStyle">
        <div class="itemSpecifications">
          <div class="specBox gotham">
            <div>
              <div class="specTitle">Rétegvastagság</div>
              <select class="specSelect" id="rvas" onchange="updateSpecs(this, ${price}, false,
                false, ${isCP})">
                <option value="0.12">0.12mm</option>
                <option value="0.20" selected>0.20mm</option>
                <option value="0.28">0.28mm</option>
              </select>
            </div>

            <div>
              <div class="specTitle">Sűrűség</div>
              <select class="specSelect" id="suruseg" onchange="updateSpecs(this, ${price},
              false, false, ${isCP})">
                <option value="10">10%</option>
    `;

    for (let i = 20; i <= 80; i += 20) {
      let selected = i == 20 ? 'selected' : '';
      output += `
        <option value="${i}" ${selected}>${i}%</option>
      `;
    }

    output += `
              </select>
            </div>
            
            <div>
              <div class="specTitle">Szín</div>
              <select class="specSelect" id="color">
    `;
    
    for (let c of PRINT_COLORS) {
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

    for (let i = 0.7; i <= 1.3; i += 0.3) {
      let selected = i == 1 ? 'selected' : '';
      output += `
        <option value="${i.toFixed(1)}" ${selected}>x${i.toFixed(1)}</option>
      `; 
    }

    output += `
              </select>
            </div>

            <div>
              <div class="specTitle">Falvastagság</div>
              <select class="specSelect" id="fvas" onchange="updateSpecs(this, ${price}, false,
              false, ${isCP})">
    `;

    for (let i = 0.8; i <= 2.4; i += 0.4) {
      let selected = i.toFixed(2) == 1.2 ? 'selected' : '';
      output += `
        <option value="${i.toFixed(1)}" ${selected}>${i.toFixed(1)}mm</option>
      `;
    }

    output += `
            </select>
          </div>
    `;

    if (isCP) {
      output += `
        <div>
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

    return output;
  } else {
    let output = `
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

    for (let c of PRINT_COLORS) {
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

    return output;
  }
}

module.exports = genSpecs;
