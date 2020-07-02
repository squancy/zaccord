/*
  Create a cookie on first visit to this page to prevent duplicating the same product
  in the cart
*/

function isVisited() {
  return `
    let isFirstVisit = true;
    if (!getCookie('isVisited') || getCookie('isVisited') == 'no') {
      setCookie('isVisited', 'yes', 365);
    } else {
      isFirstVisit = false;
    }
  `;
}

module.exports = isVisited;
