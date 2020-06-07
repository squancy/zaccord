const genSpecs = require('./includes/genSpecs.js');
const escapeVars = require('./includes/escapeVars.js');

// Build page for a specific item
const buildItemSection = (conn, itemId, req) => {
  return new Promise((resolve, reject) => {
    // Select the item from db & make sure it exists
    itemId = Number(escapeVars(itemId));
    conn.query("SELECT * FROM fix_products WHERE id = ? LIMIT 1", [itemId],
    function (err, result, fields) {
      if (err) {
        reject('Egy nem várt hiba történt, kérlek próbáld újra')
        return;
      }

      // Invalid item id
      if (result.length === 0) {
        reject('Nincs ilyen termékünk');
        return;
      }

      // Create html output 
      let output = `
        <section class="keepBottom animate__animated animate__fadeIn">
      `;

      // Get properties of item
      let id = result[0]['id'];
      let url = result[0]['url'];
      let imgUrl = result[0]['img_url'];
      let productName = result[0]['name'];
      let price = result[0]['price'];
      let size = result[0]['size'].replace(/x/g, 'mm x ');
      size += 'mm';
      let description = result[0]['description'];
      let showcaseImgs = result[0]['img_showcase'].split(',');
      let showcase = `<img src="/${imgUrl}">`;
      for (let img of showcaseImgs) {
        showcase += `<img src="/images/${img}">`;
      }
      
      output += `
        <p class="prodName hideSeek align">${productName}</p>
        <div class="centerBox">
          <div class="leftAlignBox">
            <div class="galleria">
              ${showcase}
            </div>
                <div class="itemInfo">
              <p class="prodName hideText">${productName}</p>
              <p style="margin-top: 0;">
                <span class="blue">Ár:</span> <span id="priceHolder">${price}</span> Ft
              </p>
              <p>
                <span class="blue">Méret:</span> <span id="sizeHolder">${size}</span>
              </p>
              <p>${description}</p>
            </div>
          </div>
          <div class="clear"></div>
      `;          

      output += genSpecs(price, size);

      output += `
        <div class="clear"></div>
        
        <div id="status" class="errorBox"></div>
        <div id="succBox" class="successBox"></div>
        <div id="info" class="infoBox"></div>

        <div class="specBox">
          <button class="borderBtn btnCommon" onclick="buyItem(${id})">
            Vásárlás
          </button> 
          <button class="fillBtn btnCommon" onclick="addToCart(${id})">Kosárba</button>  
        </div>

        <p class="align">
          <a href="/mitjelent" class="blueLink">Mit jelentenek ezek?</a>
        </p>

        <p class="align note">
          <span class="blue">Megjegyzés: </span> a specifikációk megváltoztatása
          árváltozást vonhat maga után!
        </p>

        <p class="align note">
          <span class="blue">Tipp: </span> ha nem szeretnél bajlódni a paraméterekkel, hagyd az
          alapbeállításokon!
        </p>
      `;

      output += `
        </section>
      `;

      output += `
        <script type="text/javascript">
          let isLoggedIn = ${req.user.id ? true : false};
        </script>
      `;
      resolve(output);
    });
  });
}

module.exports = buildItemSection;
