const constants = require('./includes/constants.js');
const PRINT_COLORS = constants.printColors;
const HEX_ARR = constants.hexArr;

// Build admin page where we can see incoming orders & update their status
const buildAdminSection = (conn) => {
  return new Promise((resolve, reject) => {
    let aQuery = `
      SELECT o.*, o.price AS aPrice, ud.email AS uemail, o.id AS oid, d.*,
      d.name AS customerName, f.*, pp.name AS packet_name, pp.zipcode AS packet_zip,
      pp.city AS packet_city
      FROM orders AS o LEFT JOIN delivery_data AS d
      ON (d.uid = o.uid OR d.order_id = o.unique_id) LEFT JOIN fix_products AS f
      ON f.id = o.item_id LEFT JOIN users AS ud ON ud.id = d.uid
      LEFT JOIN packet_points AS pp ON o.packet_id = pp.packet_id
      ORDER BY o.status ASC, o.order_time DESC`;
    conn.query(aQuery, [], (err, result, field) => {
      if (err) {
        reject('Hiba történt');
        return;
      } else if (result.length === 0) {
        resolve('Nincsen rendelés az adatbázisban');
        return;
      }

      // There are orders in db so display them
      let output = `
        <section class="keepBottom" style="margin-top: 40px;">
          <input type="text" autocomplete="off" class="searchBox" id="searchOrder"
            placeholder="Keresés az adatbázisban (utalási azonosító alapján)"
            style="width: 100%; margin-bottom: 20px;" onkeyup="jumpToOrder()">
      `;
      let sprices = {};
      for (let i = 0; i < result.length; i++) {
        let packetName = result[i].packet_name;
        let packetZipcode = result[i].packet_zip;
        let packetCity = result[i].packet_city;
        let uemail = result[i].uemail;
        let oid = result[i].oid;
        let aPrice = result[i].aPrice;
        let rvas = result[i].rvas;
        let suruseg = result[i].suruseg;
        let scale = result[i].scale;
        let color = result[i].color;
        let fvas = result[i].fvas;
        let quantity = result[i].quantity;
        let transactionID = result[i].transaction_id;
        let isFixProd = result[i].is_fix_prod;
        let transferID = result[i].transfer_id;
        let status = result[i].status;
        let shippingPrice = result[i].shipping_price;
        let cpFname = result[i].cp_fname;
        let orderTime = result[i].order_time;
        let uid = result[i].uid;

        let name = result[i].customerName;
        let postalCode = result[i].postal_code;
        let city = result[i].city;
        let address = result[i].address;
        let mobile = result[i].mobile;

        let litSphere = result[i].lit_sphere;
        let litSize = result[i].lit_size;
        let litFname = result[i].lit_fname;

        let deliveryType = Number(result[i].is_cash_on_del) ? 'háztól házig' : 'csomagpont';
        let uniqueID = result[i].unique_id;

        let billingName = result[i].billing_name;
        let billingCountry = result[i].billing_country;
        let billingCity = result[i].billing_city;
        let billingPcode = result[i].billing_pcode;
        let billingAddress = result[i].billing_address;
        let billingCompname = result[i].billing_compname;
        let billingCompTaxNum = result[i].billing_comp_tax_num;

        let normalCompname = result[i].normal_compname;
        let normalCompnum = result[i].normal_compnum;
        let nlEmail = result[i].nl_email;

        let printMat = result[i].printMat ? result[i].printMat : 'PLA';
        
        let isTransfer = 'utánvét';
        if (result[0].is_transfer) {
          isTransfer = 'előre utalás';
        } else if (transactionID) {
          isTransfer = 'bankkártyás fizetés';
        } 

        let compInfo = '';
        if (normalCompname && normalCompnum) {
          compInfo = `
            <div class="inBox"><b>Cégnév:</b> ${normalCompname}</div>
            <div class="inBox"><b>Adószám:</b> ${normalCompnum}</div>
          `; 
        }

        let hexColors = {};

        for (let i = 0; i < PRINT_COLORS.length; i++) {
          pcolor = PRINT_COLORS[i];
          hcolor = HEX_ARR[i];
          hexColors[pcolor] = hcolor;
        }

        let cColor = hexColors[color];

        let sendCE = 'Csomag szállítás/átvétel alatt';
        if (!status) {
          sendCE = `
            <span id="seHolder_${uniqueID}" style="display: block; width: 100%;">
              <button class="fillBtn btnCommon" style="margin-right: 0;" id="se_${uniqueID}"
                onclick="sendConfEmail('${uniqueID}', '${deliveryType}')">
                Megerősítő email küldése
              </button>
              <input type="text" id="glsCode_${uniqueID}" class="dFormField"
                placeholder="GLS csomagkövető kód"
                style="background-color: #fff; border: 1px solid #c3c3c3; width: auto;">
            </span>
          `;
        }

        if (litSphere) {
          var productName = 'Litofánia';
        } else {
          var productName = result[i].name ? result[i].name : 'Bérnyomtatott termék';
        }

        if (litSize) {
          litSize = result[i].lit_size.split('x').map(v => Number(v).toFixed(2))
          .join('mm x ') + 'mm';
        }

        let transferText = '';
        if (isTransfer === 'előre utalás') {
          transferText = `
            <div class="inBox">
              <b>Utalási azonosító:</b> ${transferID}
            </div>
          `;
        }

        let cpText = '';
        if (cpFname) {
          cpText = `
            <div class="inBox">
              <b>Forrás:</b>
              <a download href="/printUploads/${cpFname}.stl" class="blueLink">STL fájl</a>
            </div>
          `;
        } else if (litFname) {
          var litLink = `
            <div class="inBox">
              <b>Forrás:</b>
              <a download href="/printUploads/lithophanes/${litFname}" class="blueLink">
                Kép
              </a>
            </div>
          `;
        }

        let style = status ? 'opacity: 0.3' : 'opacity: 1';
        let checked = status ? 'checked' : '';
        
        let tFinalPrice = Math.round(quantity * aPrice);
        let nextOt = result[i + 1] ? result[i + 1].order_time : '';
        let prevOt = result[i - 1] ? result[i - 1].order_time : '';
        if (quantity * aPrice < 800 && orderTime != nextOt && orderTime != prevOt) {
          tFinalPrice += 800 - tFinalPrice;
        }

        let packetPointData = '';
        if (deliveryType === 'csomagpont') {
          packetPointData = `
            <div class="inBox"><b>Csomagpont Név:</b> ${packetName}</div>
            <div class="inBox"><b>Csomagpont Cím:</b> ${packetZipcode}, ${packetCity}</div>
          `;
        }
        
        let bInfo = `
          <div class="inBox">
            <b>Számlázási cím = szállítási cím</b>
          </div>
        `;

        if (billingName) {
          bInfo = `
            <div class="inBox"><b>Név:</b> ${billingName}</div>
            <div class="inBox"><b>Ország:</b> ${billingCountry}</div>
            <div class="inBox"><b>Város:</b> ${billingCity}</div>
            <div class="inBox"><b>Irsz.:</b> ${billingPcode}</div>
            <div class="inBox"><b>Cím:</b> ${billingAddress}</div>
          `; 

          if (billingCompname) {
            bInfo += `
              <div class="inBox"><b>Cégnév:</b> ${billingCompname}</div>
              <div class="inBox"><b>Adószám:</b> ${billingCompTaxNum}</div>
            `; 
          }
        }

        // Build html output
        output += `
          <span id="${transferID}"></span>
          <div style="${style}; text-align: center; user-select: text; padding: 10px;"
            id="box_${i}" class="flexDiv bigBox trans">
            <div class="flexDiv smallBox">
              <div class="inBox"><b>Terméknév:</b> ${productName}</div>
              <div class="inBox"><b>Ár:</b> ${aPrice} Ft</div>
              <div class="inBox">
                <b>Szín:</b>
                <span style="color: ${cColor}; background-color: #a2a2a2;
                  border-radius: 8px; padding: 3px;">${color}</span>
              </div>
        `;

        if (!litSphere) {
          output += `
              <div class="inBox"><b>Rvas:</b> ${rvas}mm</div>
              <div class="inBox"><b>Sűrűség:</b> ${suruseg}%</div>
              <div class="inBox"><b>Méretezés:</b> x${scale}</div>
              <div class="inBox"><b>Fvas:</b> ${fvas}mm</div>
              <div class="inBox"><b>Anyag:</b> ${printMat}</div>
          `;
        } else {
          output += `
              <div class="inBox"><b>Forma:</b> ${litSphere}</div>
              <div class="inBox"><b>Méret:</b> ${litSize}</div>
              ${litLink}
          `;
        }

        if (transactionID) {
          output += `
            <div class="inBox"><b>Tranzakciós ID:</b> ${transactionID}</div>
          `; 
        }

        output += `
              <div class="inBox"><b>Mennyiség:</b> ${quantity}db</div>
            </div>
            <div class="flexDiv smallBox" id="transT_${i}">
              <div class="inBox"><b>Fizetési mód:</b> ${isTransfer}</div>
              ${transferText}
            </div>
            <div class="flexDiv smallBox" id="pers_${i}">
              <div style="display: none;" id="uid_${i}">${uid}</div>
              <div class="inBox"><b>Név:</b> ${name}</div>
              <div class="inBox"><b>Irsz.:</b> ${postalCode}</div>
              <div class="inBox"><b>Város:</b> ${city}</div>
              <div class="inBox"><b>Cím:</b> ${address}</div>
              <div class="inBox"><b>Tel.:</b> ${mobile}</div>
              <div class="inBox"><b>E-mail:</b> ${uemail || nlEmail}</div>
              <div class="inBox"><b>Szállítási mód:</b> ${deliveryType}</div>
              <div class="inBox"><b>Azonosító:</b> ${uniqueID}</div>
              ${compInfo}
              ${packetPointData}
              ${sendCE}
            </div>
            <div class="flexDiv smallBox">
              <div class="inBox" id="bot_${i}">
                <b>Rendelési idő:</b> <div id="ot_${i}">${orderTime}</div>
              </div>
              ${cpText}
            </div>
            <div class="flexDiv smallBox" id="binfo_${i}">
              ${bInfo} 
            </div>
            <div class="align" style="margin: 10px 0 20px 0;" id="bac">
              <label class="chCont">Megjelölés készként
                <input type="checkbox" id="ch_${i}" ${checked} value="${Number(!status)}"
                onclick="updateStatus(${oid}, ${i})">
                <span class="cbMark"></span>
              </label>
            </div>
            <div class="gotham blue align font18" style="margin-bottom: 20px;">
              <b>Összesen:</b>
              <b id="allp_${i}" class="pc">${tFinalPrice}</b>
              <span class="blk">Ft</span>
              <span style="display: none; margin-top: 10px;" id="totpHolder_${i}" class="align">
                <b class="gotham blue">Egész rendelés ár:</b>
                <span id="totp_${i}" class="blk"></span>
                <span class="blk">Ft (szállítással együtt)</span>
              </span>
            </div>
          </div>
        `;
        sprices[i] = shippingPrice;
      }

      output += `
        </section>
        <script type="text/javascript">
          let sprices = JSON.parse('${JSON.stringify(sprices)}');
        </script>
      `;
      resolve(output);
    }); 
  });
}

module.exports = buildAdminSection;
