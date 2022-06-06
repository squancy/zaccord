const util = require('util');
const constants = require('./includes/constants.js');
const LAZY_LOAD = constants.lazyLoad;

function buildBlogItem(currentBlog) {
  let id = currentBlog.id;
  let title = currentBlog.title; 
  let categories = currentBlog.categories.split(',').map(e => e.trim()).join(', ');
  let summary = currentBlog.summary;
  let imgUrl = currentBlog.img_url;
  let date = currentBlog.date.split(' ')[0];

  return `
    <div class="blogCont trans">
      <div class="upperImg bgCommon lazy" data-bg="/images/blog/${imgUrl}"
       style="background-color: rgb(53, 54, 58);">
        <div class="darken"></div>
        <h2 class="blogTitle fontNorm gotham font20">${title}</h2>
        <p class="gothamNormal font14">${date}</p>
      </div>
      <div class="middleSummary">
        <p class="gothamNormal maz">${summary}</p>
        <br>
        <p class="gotham maz catLines">
          <span>Kategóriak:</span> ${categories}
        </p>
      </div>
      <div class="lowerReadMore">
        <hr class="hrStyle">
        <a href="/blog?id=${id}">
          <button class="fillBtn btnCommon">Olvass tovább</button>
        </a>
      </div>
    </div>
  `;
}

async function buildBlogsSection(conn) {
  // Promisify conn.query so that it can be used with an async/await function
  const query = util.promisify(conn.query).bind(conn);

  let content = `
    <section class="keepBottom lh ofv">
      <div class="flexDiv flexWrap flSpAr">
  `;

  let res = await query('SELECT * FROM blog');
  for (let currentBlog of Array.from(res)) {
    content += buildBlogItem(currentBlog);
  }

  content += `
      </div>
    </section>
    ${LAZY_LOAD}
  `;

  return content;
}

module.exports = {
  buildBlogsSection,
  buildBlogItem
};
