const constants = require('./includes/constants.js');
const addHours = require('./includes/addHours.js');
const getColors = require('./includes/getColors.js');
const EUDateFormat = require('./includes/EUDateFormat.js');
const shipping = require('./includes/shippingConstants.js');
const SHIPPING_OBJ = shipping.shippingObj;
const PACKET_POINT_TYPES_R = shipping.packetPointTypesR;
const MONEY_HANDLE = shipping.moneyHandle;

// Build admin page where we can see incoming orders & update their status
const buildAdminSection = (conn) => {
  return new Promise((resolve, reject) => {
    getColors(conn).then(([colors, hex_codes]) => {
      let hexColors = {};
      for (let key of Object.keys(colors)) {
        for (let el of colors[key]) {
          if (Object.keys(hexColors).indexOf(el) < 0) {
            hexColors[el] = hex_codes[key][el];
          }
        }
      }

      let aQuery = `
        SELECT o.*, o.price AS aPrice, ud.email AS uemail, o.id AS oid, d.*,
        d.name AS customerName, f.*, pp.name AS packet_name, pp.zipcode AS packet_zip,
        pp.city AS packet_city, pp.packet_id AS packet_point_id, pp.lat AS lat, pp.lon AS lon
        FROM orders AS o LEFT JOIN delivery_data AS d
        ON (d.uid = o.uid OR d.order_id = o.unique_id) LEFT JOIN fix_products AS f
        ON f.id = o.item_id LEFT JOIN users AS ud ON ud.id = d.uid
        LEFT JOIN packet_points AS pp ON o.packet_id = pp.packet_id
        ORDER BY o.status ASC, o.order_time DESC LIMIT 50`;
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
            <p class="align">
              <a download href="/spreadsheets/shippingCredentials.xlsx" class="blueLink">Szállitás xlsx</a>
              <button id="markAll" class="fillBtn btnCommon" onclick="markAll()">
                Megbassza az összeset
              </button>
              <button class="fillBtn btnCommon" onclick="goToID('protQuotes')">
                Prototípus kérések
              </button>
              <button class="fillBtn btnCommon" onclick="downloadSTLs()">
                STL letöltés
              </button>
              <button class="fillBtn btnCommon" onclick="goToID('zprod')">
                Z-termék
              </button>
              <span id="downloadStatus">
              </span>
            </p>
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
          let orderTime = EUDateFormat(addHours(result[i].order_time, 2));
          let uid = result[i].uid;
          let printTech = result[i].printTech;
          let comment = result[i].comment;
          let dt = result[i].del_type;

          let name = result[i].customerName;
          let postalCode = result[i].postal_code;
          let city = result[i].city;
          let address = result[i].address;
          let mobile = result[i].mobile;

          let litSphere = result[i].lit_sphere;
          let litSize = result[i].lit_size;
          let litFname = result[i].lit_fname;

          let deliveryType = result[i].del_type;
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

          let ppID = result[i].packet_point_id;
          let ppLat = result[i].lat;
          let ppLon = result[i].lon;

          let printMat = result[i].printMat ? result[i].printMat : 'PLA';
          let isEInvoice = result[i].e_invoice;

          let isTransfer = 'utánvét';
          let lookup = shippingPrice - MONEY_HANDLE;
          if (Number(result[i].is_transfer)) {
            isTransfer = 'előre utalás';
            lookup += MONEY_HANDLE;
          } else if (transactionID) {
            isTransfer = 'bankkártyás fizetés';
            lookup += MONEY_HANDLE;
          } 

          for (let key of Object.keys(SHIPPING_OBJ)) {
            if (SHIPPING_OBJ[key]['radioID'] == deliveryType) {
              var delTypeTxt = SHIPPING_OBJ[key]['title'];
            }
          }
          
          let compInfo = '';
          if (normalCompname && normalCompnum) {
            compInfo = `
              <div class="inBox"><b>Cégnév:</b> ${normalCompname}</div>
              <div class="inBox"><b>Adószám:</b> ${normalCompnum}</div>
            `; 
          }

          let cColor = hexColors[color];

          let sendCE = 'Csomag szállítás/átvétel alatt';
          let isPP = PACKET_POINT_TYPES_R.indexOf(deliveryType) > -1;
          
          if (isEInvoice) {
            var invoicePart = `
              <p id="invGen_${uniqueID}">
                <a class="blueLink" href="/e-invoices/${uniqueID}.pdf" download>E-számla letöltés</a>
              </p>
            `;
          } else {
            var invoicePart = `
              <p id="invGen_${uniqueID}">
                <a class="blueLink" onclick="generateInvoice(${uniqueID}, ${lookup})">Számla generálás</a>
              </p>
            `;
          }

          if (!status) {
            sendCE = `
              <span id="seHolder_${uniqueID}" style="display: block; width: 100%;">
                <button class="fillBtn btnCommon" style="margin-right: 0;" id="se_${uniqueID}"
                  onclick="sendConfEmail('${uniqueID}', '${deliveryType}')">
                  Megerősítő email küldése
                </button>
                <input type="text" id="glsCode_${uniqueID}" class="dFormField"
                  placeholder="csomagkövető kód"
                  style="background-color: #fff; border: 1px solid #c3c3c3; width: auto;">
                ${invoicePart}
                <p id="plink_${uniqueID}">
                  <a class="blueLink"
                    onclick="createPacket(${uniqueID}, ${i}, ${ppID}, ${isPP}, '${delTypeTxt}')">
                    Packeta
                  </a>
                </p>
              </span>
              <span id="excelDel_${uniqueID}">
                <button class="fillBtn btnCommon" onclick="delFromExcel(${uniqueID})">
                  Törlés az excelből
                </button>
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
          let lastName = name ? name.split(' ')[0] : '';
          if (cpFname) {
            let pm = printMat;
            let fv = fvas;
            if (printTech == 'SLA') {
              pm = fv = 'X';
            }
            let downloadFname = `${lastName}_${color}_${quantity}_${pm}_${suruseg}_${rvas}_${printTech}_${fv}_${scale}`;
            cpText = `
              <div class="inBox">
                <b>Forrás:</b>
                <a download="${downloadFname}.stl" href="/printUploads/${cpFname}.stl" class="blueLink">STL fájl</a>
                <a download="${downloadFname}.gcode" href="/gcode/${cpFname}.gcode" class="blueLink">G-code</a>
              </div>
            `;
          } else if (litFname) {
            let x = litFname.split('.');
            let ext = x[x.length - 1];
            var litLink = `
              <div class="inBox">
                <b>Forrás:</b>
                <a download="${lastName}_${litSize}_${color}_${litSphere}.${ext}"
                  href="/printUploads/lithophanes/${litFname}" class="blueLink">
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
          if (isPP) {
            packetPointData = `
              <div class="inBox"><b>Csomagpont Név:</b> <span id="pname_${uniqueID}">${packetName}</div>
              <div class="inBox"><b>Csomagpont Cím:</b> ${packetZipcode}, ${packetCity}</div>
            `;

            if (ppLat && ppLon) {
              packetPointData += `
                <div class="inBox"><b>Csomagpont Lat.:</b> ${ppLat}</div>
                <div class="inBox"><b>Csomagpont Lon.:</b> ${ppLon}</div>
              `;
            }
          }
          
          let bInfo = `
            <div class="inBox">
              <b>Számlázási cím = szállítási cím</b>
            </div>
          `;

          if (comment) {
            bInfo += `
              <div class="inBox"><b>Megjegyzés:</b> ${comment}</div>
            `;
          }

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
                  <span style="color: #${cColor}; background-color: #a2a2a2;
                    border-radius: 8px; padding: 3px;">${color}</span>
                </div>
          `;

          if (!litSphere) {
            let postfix = '%';
            if (suruseg == 'Tömör' || suruseg == 'Üreges') {
              postfix = '';
            }
            output += `
                <div class="inBox"><b>Rvas:</b> ${rvas}mm</div>
                <div class="inBox"><b>Sűrűség:</b> ${suruseg}${postfix}</div>
                <div class="inBox"><b>Méretezés:</b> x${scale}</div>
                <div class="inBox"><b>Fvas:</b> ${fvas}mm</div>
            `;

            if (printTech != 'SLA') {
              output += `
                <div class="inBox"><b>Anyag:</b> ${printMat}</div>
              `;
            }

            output += `
                <div class="inBox"><b>Technológia:</b> ${printTech}</div>
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
                <div class="inBox">
                  <b>Fizetési mód:</b>
                  <span id="paymentType_${uniqueID}">${isTransfer}</span>
                </div>
              </div>
              <div class="flexDiv smallBox" id="pers_${i}">
                <div style="display: none;" id="uid_${i}">${uid}</div>
                <div class="inBox"><b>Név:</b> <span id="customerName_${uniqueID}">${name}</span></div>
                <div class="inBox"><b>Irsz.:</b> <span id="postalCode_${uniqueID}">${postalCode}</span></div>
                <div class="inBox"><b>Város:</b> <span id="city_${uniqueID}">${city}</span></div>
                <div class="inBox"><b>Cím:</b> <span id="address_${uniqueID}">${address}</span></div>
                <div class="inBox"><b>Tel.:</b> <span id="mobile_${uniqueID}">${mobile}</span></div>
                <div class="inBox"><b>E-mail:</b> <span id="email_${uniqueID}">${uemail || nlEmail}</span></div>
                <div class="inBox"><b>Szállítási mód:</b> ${delTypeTxt}</div>
                <div class="inBox"><b>Azonosító:</b> <span id="id_${uniqueID}">${uniqueID}</div>
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
                  <span id="totp_${i}" class="blk totalPrice_${uniqueID}"></span>
                  <span class="blk">Ft (szállítással együtt)</span>
                  <br><br>
                </span>
              </div>
            </div>
          `;
          sprices[i] = shippingPrice;
        }
        
        conn.query('SELECT * FROM prototype ORDER BY date DESC LIMIT 50', [], (err, res, field) => {
          if (err) {
            reject(err);
            return;
          }

          output += `
            <p class="mainTitle ffprot" id="protQuotes">Prototípus ajánlatkérések</p>
            <div style="overflow-x: auto;">
              <table class="protTbl">
                <tr>
                  <th>Név</th>
                  <th>Email</th>
                  <th>Mobil</th>
                  <th>Üzenet</th>
                  <th>Idő</th>
                </tr>
          `;
          for (let i = 0; i < res.length; i++) {
            output += `
              <tr>
                <td>${res[i].name}</td>
                <td>${res[i].email}</td>
                <td>${res[i].mobile}</td>
                <td>${res[i].message}</td>
                <td>${res[i].date}</td>
              </tr>
            `; 
          }

          output += `
                </table>
              </div>
            </section>
            <p class="mainTitle" id="zprod">Z-termék</p>
            <div style="width: 80%; margin: 0 auto;">
              <p>Új Z-termék generálás</p>
              <input type="text" placeholder="Ár" id="zprodPrice">
              <input type="text" placeholder="Érvényesség ideje (nap)" id="zprodExpiry"
               value="3">
              <button id="genZprod">Generálás</button>
              <span id="genStatus"></span>
            </div>
            <div style="width: 80%; margin: 0 auto;">
              <p>Generált Z-termékek</p>
              <div style="overflow-x: auto;">
                <table class="protTbl">
                  <tr id="zprodTbl">
                    <th>URL</th>
                    <th>Ár</th>
                    <th>Aktív</th>
                    <th>Generálás ideje</th>
                    <th>Érvényesség (nap)</th>
                    <th>Törlés</th>
                  </tr>
            `;
            
            conn.query('SELECT * FROM z_prod ORDER BY creation_date DESC', [], (err, res, field) => {
              if (err) {
                reject(err);
                return;
              }

              for (let el of res) {
                output += `
                  <tr id="zprod_${el.url}">
                    <td>
                      <a href="/z-product?id=${el.url}">${el.url}</a>
                      <button onclick="copyURL('${el.url}')">copy</button>
                    </td>
                    <td>${el.price}</td>
                    <td>${el.is_live}</td>
                    <td>${el.creation_date}</td>
                    <td>${el.expiry}</td>
                    <td><button onclick="deleteZprod('${el.url}')">X</button></td>
                  </tr>
                `; 
              }

              output += `
                  </table>
                </div>
              </div>
              <script type="text/javascript">
                let sprices = JSON.parse('${JSON.stringify(sprices)}');

                function goToID(id) {
                  _(id).scrollIntoView();
                }
              </script>
            `;
            resolve(output);
          });
        });
      }); 
    });
  });
}

module.exports = buildAdminSection;
