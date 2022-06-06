for (let holder of document.getElementsByClassName('yearHolder')) {
  holder.innerHTML = new Date().getFullYear();
}
