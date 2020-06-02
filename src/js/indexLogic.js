// Build the index page from fixed products
const buildMainSection = (conn, sValue = null, isEmpty = false) => {
  return new Promise((resolve, reject) => {
    // Check if used in search query
    if (!sValue && !isEmpty) {
      var sQuery = "SELECT * FROM fix_products";
    } else {
      var sQuery = `SELECT * FROM fix_products WHERE name LIKE '%${sValue}%'`;
    }

    conn.query(sQuery, function (err, result, fields) {
      if (err) {
        reject('Egy nem várt hiba történt, kérlek próbáld újra')
        return;
      }

      // Create html output 
      let output = '';
      if (!sValue && !isEmpty) {
        output = `
          <section class="mainShowcase keepBottom animate__animated animate__fadeIn">
            <input type="text" autocomplete="off" class="searchBox" placeholder="Keresés"
              onkeyup="searchForItem()" id="sfi" />
            <div id="dynamicShowcase">
        `;
      }

      for (let i = 0; i < result.length; i++) {
        let id = result[i]['id'];
        let url = result[i]['url'];
        let imgUrl = result[i]['img_url'];
        let productName = result[i]['name'];
        let price = result[i]['price'];
        output += `
          <a href="/${url}">
            <div class="productItem bgCommon" id="pi_${id}"
              style="background-image: url('/${imgUrl}')"
              onmouseenter="animateElement('priceTag_${id}', 'fadeIn', 'fadeOut', 0.3, true)"
              onmouseleave="animateElement('priceTag_${id}', 'fadeIn', 'fadeOut', 0.3, false)">

              <div class="priceShow animate__animated" id="priceTag_${id}">
                <p>${productName}</p>
                <p>${price}Ft</p>
              </div>
            </div>
          </a>
        `;
      }

      if (!sValue && !isEmpty) {
        output += `
            </div>
          </section>
        `;
      }

      // If, while searhing, there is no output display error msg
      if (!result.length && !output) {
        output = 'Sajnos nincs ilyen termékünk...';
      }
      resolve(output);
    });
  });
}

module.exports = buildMainSection;
