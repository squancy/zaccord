const escapeVars = require('./includes/escapeVars.js');

// Build the index page from fixed products & also used to build output when searching
const buildMainSection = (conn, sValue = null, isEmpty = false, isCat = false) => {
  return new Promise((resolve, reject) => {
    // Check if used in search query
    let isDefault = false;
    if ((!sValue && !isEmpty) || sValue === 'Összes') {
      var sQuery = 'SELECT * FROM fix_products';
      if (sValue != 'Összes') isDefault = true;
    } else if (isCat) {
      sValue = escapeVars(sValue);
      var sQuery = `SELECT * FROM fix_products WHERE category = '${sValue}'`; 
    } else {
      sValue = escapeVars(sValue);
      var sQuery = `SELECT * FROM fix_products WHERE name LIKE '%${sValue}%' OR description
        LIKE '%${sValue}%'`;
    }

    conn.query(sQuery, function (err, result, fields) {
      if (err) {
        console.log(err);
        reject('Egy nem várt hiba történt, kérlek próbáld újra');
        return;
      }

      // Create html output 
      let output = '';
      if (!sValue && !isEmpty) {
        output = `
          <section class="mainShowcase keepBottom animate__animated animate__fadeIn">
            <section class="topHolder">
              <input type="text" autocomplete="off" class="searchBox" placeholder="Keresés"
                onkeyup="searchForItem()" id="sfi" />
              <div class="categoryImg" onclick="toggleCategory()" id="categoryImg">
                <img src="/images/vmenu.png" title="Kategóriák">
              </div>
            </section>
            <div class="clear"></div>
            <div class="catBox" id="catBox" style="margin: 0; display: none;">
              <div onclick="sortByCat('Telefontok')">
                Telefontok
              </div>
              <div onclick="sortByCat('Kulcstartó')">
                Kulcstartó
              </div>
              <div onclick="sortByCat('Telefon kiegészítők')">
                Telefon kiegészítők
              </div>
              <div onclick="sortByCat('Háztartási eszközök')">
                Háztartási eszközök
              </div>
              <div onclick="sortByCat('Összes')">
                Összes
              </div>
            </div>
            <div id="dynamicShowcase">
        `;
      }

      // Loop through all fixed items in the db
      for (let i = 0; i < result.length; i++) {
        let id = result[i]['id'];
        let url = result[i]['url'];
        let imgUrl = result[i]['img_url'];
        let productName = result[i]['name'];
        let price = result[i]['price'];
        if (isDefault) {
          var bgStyle = `style="background-color: rgb(53, 54, 58);"
            data-bg="/${imgUrl}"`;
        } else {
          var bgStyle = `style="background-image: url('/${imgUrl}')"`;
        }
        output += `
          <a href="/${url}">
            <div class="productItem bgCommon lazy" id="pi_${id}"
              ${bgStyle}
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

      // Add lazy load of images
      output += `
        <script src="/js/includes/lazyLoad.js"></script>
        <script type="text/javascript">
          var ll = new LazyLoad({
            elements_selector: ".lazy",
          });
        </script>
      `;
      resolve(output);
    });
  });
}

module.exports = buildMainSection;
