NProgress.configure({ showSpinner: false });
NProgress.configure({ trickleSpeed: 10 });
document.addEventListener('DOMContentLoaded', (event) => {
  if (document.getElementsByTagName('html')[0].classList[0]) {
    NProgress.start();
  } else {
    NProgress.done();
  }
});

window.onload = (event) => {
  NProgress.done();
};

window.addEventListener("beforeunload", () => NProgress.start());
