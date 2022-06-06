function hideOnClickOutside(element, callback) {
  const outsideClickListener = event => {
    if (!element.contains(event.target) && isVisible(element)) { 
      callback();
      removeClickListener()
    }
  }

  const removeClickListener = () => {
    document.removeEventListener('click', outsideClickListener)
  }

  document.addEventListener('click', outsideClickListener)
}

const isVisible = elem => !!elem && !!(elem.offsetWidth || elem.offsetHeight ||
  elem.getClientRects().length);
