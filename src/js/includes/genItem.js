// Generate an html box for an item
function genItem(isOrderTime = false, isStat = false, isPaymentOption = false, data,
  isLit = false, isUID = false, isCP = false, isZprod = false) {
  let printTech = data.tech;
  let output = `
    <div class="cartItemHolder">
      <div class="itemLeftCenter">
        <a href="/${data.prodURL}">
          <div class="cartImgHolder bgCommon" style="background-image: url(/${data.imgURL})">
          </div>
        </a>
        <div style="padding: 10px;" class="hideText">
          <p>
            <a href="/${data.prodURL}" class="linkTitle">${data.name}</a>
          </p>
        </div>
      </div>

      <div class="flexDiv prodInfo ordersSoFar">
      `;
  
  if (isZprod) {
    output += `
      <div>
        <p style="text-align: center;">
          A sűrűség, rétegvastagság, falvastagság és egyéb paraméterek a lehető legoptimálisabban
          lesznek beállítva, hogy a legmegfelelőbb eredményt érjük el.
        </p>
      </div>
    `;
  } else {
    output += `
      <div>
        <p>Egységár: ${data.price} Ft</p>
      </div>
    `;

    if (!isLit) {
      let postfix = '%';
      if (printTech == 'SLA') postfix = '';
      output += `
        <div>
          <p>Rétegvastagság: ${data.rvas}mm</p>
        </div>
        <div>
          <p>Sűrűség: ${data.suruseg}${postfix}</p>
        </div>
      `;
    }

    output += `
      <div>
        <p>Szín: ${decodeURIComponent(data.color)}</p>
      </div>
    `;

    if (isCP) {
      output += `
        <div>
          <p>Anyag: ${data.printMat}</p>
        </div>
      `;
    }

    if (isCP) {
      output += `
        <div>
          <p>Technológia: ${data.tech}</p>
        </div>
      `;
    }

    if (!isLit) {
      output += `
        <div>
          <p>Méretezés: x${data.scale}</p>
        </div>
      `;

      if (printTech != 'SLA') {
        output += `
          <div>
            <p>Falvastagság: ${data.fvas}mm</p>
          </div>
        `;
      }
    } else {
      output += `
        <div>
          <p>Forma: ${data.sphere}</p>
        </div>
        <div>
          <p>Méret: ${data.size.split('x').map(v => Number(v).toFixed(2)).join('x')
            .replace(/x/g, 'mm x ') + 'mm'}</p>
        </div>
      `; 
    }

    output += `
      <div>
        <p>Mennyiség: ${data.quantity}db</p>
      </div>
    `;

    if (isStat) {
      let className = data.stat ? 'delivered' : 'inProgress';
      let text = data.stat ? 'kinyomtatva' : 'folyamatban';
      output += `
        <div>
          <p>Státusz: <span class="${className}">${text}</span></p>
        </div>
      `;
    }

    if (data.finalPO) {
      output += `
        <div>
          <p>Fizetési mód: ${data.finalPO}</p>
        </div>
      `;
    }

    if (isOrderTime) {
      output += `
        <div>
          <p>Rendelési idő: ${data.orderTime}</p>
        </div>
      `;
    }

    if (isUID) {
      output += `
        <div>
          <p>Azonosító: <span class="blue">${data.uid}</span></p>
        </div>
      `;
    }
  }

  output += `
        <div>
          <p class="bold">Összesen: ${data.quantity * data.price} Ft</p>
        </div>
      </div>
      <div class="clear"></div>
    </div>
  `;

  return output;
}

module.exports = genItem;
