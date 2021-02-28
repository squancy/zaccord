function makeInline(html) {
  let localHTML = html;
  let cartItemHolder = `
    style = "
      width: 100%;
      position: relative;
      padding: 10px;
      border: 1px solid #dfdfdf;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02), 0 1px 2px rgba(0, 0, 0, 0.04);
      border-radius: 30px;
      margin-bottom: 20px;
      box-sizing: border-box;
    "
  `;

  let itemLeftCenter = `
    style = "
      width: 100%;
      border-right: none;
      border-bottom: 1px solid #dfdfdf;
      padding: 10px;
      box-sizing: border-box;
    "
  `;

  let linkTitle = `
    style = "
      cursor: pointer;
      color: #4285f4;
      text-decoration: none;
      font-family: 'Gotham', 'Roboto', sans-serif;
      box-sizing: border-box;
    "
  `;

  let longClass = `
    style = "
      display: table;
      width: 100%;
      margin-top: 10px;
      box-sizing: border-box;
    "
  `;

  let clear = `
    style = "
      clear: both;
    "
  `;

  let cartImgHolder = `
    width: 90px;
    height: 90px;
    border-radius: 50%;
    border: 2px solid #4285f4;
    transition: all ease-in-out 0.3s;
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
    margin: 0 auto;
    box-sizing: border-box;
  `;

  let url = 'https://www.zaccord.com';

  localHTML = localHTML
    .replace(/class="cartItemHolder"/g, cartItemHolder)
    .replace(/class="itemLeftCenter"/g, itemLeftCenter)
    .replace(/style="padding: 10px;"/g, 'style="display: none;"')
    .replace(/class="linkTitle"/g, linkTitle)
    .replace(/class="flexDiv prodInfo ordersSoFar"/g, longClass)
    .replace(/class="clear"/g, clear)
    .replace(/url\(/g, 'url(' + url)
    .replace(/url\((.+)\)"/g, 'url($1);' + cartImgHolder + '"')
    .replace(/href="\/item\/(.+)"/g, `href="${url}/item/$1" style="margin: 0 auto;"`);

  return localHTML;
}

module.exports = makeInline;
