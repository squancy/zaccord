_('color').addEventListener('change', function changeColor(e) {
  let v = _('color').value;
  let colorMaps = {
    'Fehér': '#ffffff',
    'Fekete': '#000000',
    'Kék': '#4285f4',
    'Piros': '#dc143c',
    'Sárga': '#ffff33',
    'Zöld': '#32cd32'
  };
  chooseColor(colorMaps[v]);
});

function priceChange() {
  let v = _('quantity').value;
  _('priceHolder').innerHTML = basePrice * v;
}

_('quantity').addEventListener('change', priceChange);
_('fvas').addEventListener('change', priceChange);
_('scale').addEventListener('change', priceChange);
_('suruseg').addEventListener('change', priceChange);
_('rvas').addEventListener('change', priceChange);
