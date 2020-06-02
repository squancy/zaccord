function genItem(isOrderTime = false, isStat = false, isPaymentOption = false, data) {
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
        <div>
          <p>Egységár: ${data.price} Ft</p>
        </div>
        <div>
          <p>Rétegvastagság: ${data.rvas}mm</p>
        </div>
        <div>
          <p>Sűrűség: ${data.suruseg}%</p>
        </div>
        <div>
          <p>Méretezés: x${data.scale}</p>
        </div>
        <div>
          <p>Falvastagság: ${data.fvas}mm</p>
        </div>
        <div>
          <p>Mennyiség: ${data.quantity}db</p>
        </div>
  `;

  if (isStat) {
    let className = data.stat ? 'delivered' : 'inProgress';
    let text = data.stat ? 'teljesítve' : 'folyamatban';
    output += `
      <div>
        <p>Státusz: <span class="${className}">${text}</span></p>
      </div>
    `;
  }

  if (isPaymentOption) {
    let text = data.paymentOption ? 'előre utalás' : 'utánvétel';
    output += `
      <div>
        <p>Fizetési mód: ${text}</p>
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

  output += `
        <div>
          <p>Összesen: ${data.quantity * data.price} Ft</p>
        </div>
      </div>
      <div class="clear"></div>
    </div>
  `;

  return output;
}

module.exports = genItem;
