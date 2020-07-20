// Search for items in db by name
function jsonSafe(data) {
  try {
    let a = JSON.parse(data);
  } catch (e) {
    return false;
  }
  return true;
}

function toggleShowcase(status) {
  if (status === 'show') {
    _('wideShowcase').style.display = 'block';
    _('popProds').style.display = 'block';
    _('ms').style.marginTop = '0';
    if (window.mobileCheck()) {
      _('wideShowcase').style.marginTop = '110px';
    } else {
      _('wideShowcase').style.marginTop = '150px';
    }
  } else {
    _('wideShowcase').style.display = 'none';
    _('popProds').style.display = 'none';
    if (!window.mobileCheck()) {
      _('ms').style.marginTop = '140px';
    } else {
      _('ms').style.marginTop = '110px';
    }
  }
}

let startTime = Date.now();
let to;
let showedEmpty = false;
function searchForItem() {
  let currentTime = Date.now();
  let value = _('sfi').value;

  // Prevent empty searches after all content is shown
  if (!value && showedEmpty) return;
  
  _('dynamicShowcase').innerHTML = `
    <img src="/images/icons/loader.gif" style="height: 40px; margin-bottom: 10px;">
  `;

  // Only send the text to server in every 3/4 secs
  if (currentTime - startTime < 0.75 * Math.pow(10, 3)) {
    clearTimeout(to);
    to = setTimeout(searchForItem, currentTime - startTime);
    return;
  } else {
    startTime = currentTime;
  }

  // Scroll to top
  window.scrollTo({
    top: 0
  });
  
  // Make AJAX call to server
  let data = {
    'value': value
  }

  // If search query is empty show all items
  if (!value) {
    data.isEmpty = true;
    toggleLower('block');
    toggleShowcase('show');
    showedEmpty = true;
  } else {
    toggleLower('none');
    toggleShowcase('hide');
    showedEmpty = false;
  }

  // Push data to server side for output
  fetch('/search', {
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify(data)
  }).then(response => {
    return response.text();
  }).then(data => {
    if (jsonSafe(data) && JSON.parse(data).error) {
      _('dynamicShowcase').innerHTML = JSON.parse(data).error;
      return;
    }
    _('dynamicShowcase').innerHTML = data;
    ll.update();
  }).catch(err => {
    _('dynamicShowcase').innerHTML = `
      <div>
        <img src="/images/icons/nofound.png" class="emptyCart">
        <p class="dgray font18">Hiba történt a keresés során</p>
      </div>
    `;
  });
}
