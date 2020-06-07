// Search for items in db by name
function jsonSafe(data) {
  try {
    let a = JSON.parse(data);
  } catch (e) {
    return false;
  }
  return true;
}

function searchForItem() {
  let value = _('sfi').value;
  
  // Make AJAX call to server
  let data = {
    'value': value
  }

  // If search query is empty show all items
  if (!value) {
    data.isEmpty = true;
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
  }).catch(err => {
    console.log('a', err);
    _('dynamicShowcase').innerHTML = '<p>Hoppá... hiba történt a keresés közben</p>';
  });
}
