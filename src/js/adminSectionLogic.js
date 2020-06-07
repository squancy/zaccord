// Build admin page where we can see incoming orders & update their status
const buildAdminSection = (conn) => {
  return new Promise((resolve, reject) => {
    let aQuery = `
      SELECT o.*, o.price AS aPrice, o.id AS oid, d.*, d.name AS customerName, f.*
      FROM orders AS o LEFT JOIN delivery_data AS d
      ON d.uid = o.uid LEFT JOIN fix_products AS f
      ON f.id = o.item_id ORDER BY o.status ASC, o.order_time DESC`;
    conn.query(aQuery, [], (err, result, field) => {
      if (err) {
        reject('hiba történt');
        return;
      } else if (result.length === 0) {
        resolve('nincsen rendelés az adatbázisban');
        return;
      }

      // There are orders in db so display them
      let output = '';
      let sprices = {};
      for (let i = 0; i < result.length; i++) {
        let oid = result[i].oid;
        let aPrice = result[i].aPrice;
        let rvas = result[i].rvas;
        let suruseg = result[i].suruseg;
        let scale = result[i].scale;
        let color = result[i].color;
        let fvas = result[i].fvas;
        let quantity = result[i].quantity;
        let isTransfer = result[i].is_transfer ? 'előre utalás' : 'utánvét';
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

        let productName = result[i].name ? result[i].name : 'Bérnyomtatott termék';

        let transferText = '';
        if (isTransfer === 'előre utalás') {
          transferText = '<b>Utalási azonosító:</b> ' + transferID;
        }

        let cpText = '';
        if (cpFname) {
          cpText = `<a download href="/printUploads/${cpFname}.stl">STL fájl</a>`;
        }

        let style = status ? 'opacity: 0.3' : 'opacity: 1';
        let checked = status ? 'checked' : '';
        
        let charge = 0;
        if (quantity * aPrice < 1500) charge = 1500;

        // Build html output
        output += `
          <div style="${style}; text-align: center;" id="box_${i}">
            <span style="margin: 10px;"><b>Terméknév:</b> ${productName}</span>
            <span style="margin: 10px;"><b>Ár:</b> ${aPrice} Ft</span>
            <span style="margin: 10px;"><b>Rvas:</b> ${rvas}mm</span>
            <span style="margin: 10px;"><b>Sűrűség:</b> ${suruseg}%</span>
            <span style="margin: 10px;"><b>Szín:</b> ${color}</span>
            <span style="margin: 10px;"><b>Méretezés:</b> x${rvas}</span>
            <span style="margin: 10px;"><b>Fvas:</b> ${rvas}mm</span>
            <span style="margin: 10px;"><b>Mennyiség:</b> ${quantity}db</span>
            <br><br>
            <span style="margin: 10px;"><b>Fizetési mód:</b> ${isTransfer}</span>
            <span style="margin: 10px;">${transferText}</span>
            <br><br>
            <span style="display: none;" id="uid_${i}">${uid}</span>
            <span style="margin: 10px;"><b>Név:</b> ${name}</span>
            <span style="margin: 10px;"><b>Irsz.:</b> ${postalCode}</span>
            <span style="margin: 10px;"><b>Város:</b> ${city}</span>
            <span style="margin: 10px;"><b>Cím:</b> ${address}</span>
            <span style="margin: 10px;"><b>Tel.:</b> ${mobile}</span>
            <span style="margin: 10px;">
              <b>Rendelési idő:</b> <span id="ot_${i}">${orderTime}</span>
            </span>
            <span style="margin: 10px;">${cpText}</span>
            <br>
            <input type="checkbox" id="ch_${i}" ${checked} value="${Number(!status)}"
              style="display: block; margin: 0 auto; margin-top: 10px; width: 30px;
              height: 30px;" onclick="updateStatus(${oid}, ${i})">
            <p style="text-align: center;">
              <i><b>Összesen:</b></i>
              <span id="allp_${i}">${quantity * aPrice}</span> Ft
            </p>
            <p style="text-align: center; display: none;" id="totpHolder_${i}">
              <u><i><b>Egész rendelés ár:</b></i></u> <span id="totp_${i}"></span> Ft
              (szállítással együtt)
            </p>
          </div>
          <hr id="hr_${i}">
        `;
        sprices[i] = shippingPrice;
      }

      output += `
        <script type="text/javascript">
          let sprices = JSON.parse('${JSON.stringify(sprices)}');
        </script>
      `;
      resolve(output);
    }); 
  });
}

module.exports = buildAdminSection;
