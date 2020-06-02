function genSpecs(price, size) {
  let output = `
    <hr class="hrStyle">
      <div class="itemSpecifications">
        <p id="spec" class="align">Specifikációk</p>
        <div class="specBox">
          <div>
            <div class="specTitle">Rétegvastagság</div>
            <select class="specSelect" id="rvas" onchange="updateSpecs(this, ${price})">
              <option value="0.12">0.12mm</option>
              <option value="0.16">0.16mm</option>
              <option value="0.20" selected>0.20mm</option>
              <option value="0.28">0.28mm</option>
            </select>
          </div>

          <div>
            <div class="specTitle">Sűrűség</div>
            <select class="specSelect" id="suruseg" onchange="updateSpecs(this, ${price})">
  `;

  for (let i = 10; i <= 100; i += 10) {
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
  
  for (let c of ['Fekete', 'Fehér', 'Kék', 'Piros', 'Zöld', 'Sárga']) {
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

  for (let i = 0.7; i <= 1.3; i+= 0.3) {
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
            <select class="specSelect" id="fvas" onchange="updateSpecs(this, ${price})">
  `

  for (let i = 0.4; i <= 3.6; i += 0.8) {
    let selected = i.toFixed(2) == 1.2 ? 'selected' : '';
    output += `
      <option value="${i.toFixed(1)}" ${selected}>${i.toFixed(1)}mm</option>
    `;
  }

  output += `
            </select>
          </div>

          <div>
            <div class="specTitle">Mennyiség</div>
            <select class="specSelect" id="quantity">
  `
  
  for (let i = 1; i <= 10; i++) {
    output += `
      <option value="${i}">${i}db</option>
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

module.exports = genSpecs;
