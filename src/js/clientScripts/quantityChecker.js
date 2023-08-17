function _hideBtn(name) {
  _(name).style.opacity = '0.4';
  _(name).style.cursor = 'not-allowed';
}

function _showBtn(name) {
  _(name).style.opacity = '1';
  _(name).style.cursor = 'pointer';
}

window.addEventListener("DOMContentLoaded", () => {
  _('quantity').addEventListener('keyup', () => {
    // Do not allow the user to enter a too small or too large quantity
    let v = Number(_('quantity').value);
    let isEmpty = _('quantity').value == '';
    if (v < MIN_QUANTITY && !isEmpty) {
      _('quantity').value = MIN_QUANTITY;
      _hideBtn('minus');
      _showBtn('plus');
    } else if (v > MAX_QUANTITY && !isEmpty) {
      _('quantity').value = MAX_QUANTITY;
      _hideBtn('plus');
      _showBtn('minus');
    }

    // Update the plus/minus buttons accordingly
    let curVal = Number(_('quantity').value);
    if (curVal == MIN_QUANTITY) {
      _hideBtn('minus');
      _showBtn('plus');
    } else if (curVal == MAX_QUANTITY) {
      _hideBtn('plus');
      _showBtn('minus');
    } else {
      _showBtn('plus');
      _showBtn('minus');
    }
  });
});
