function statusFill(cont, msg) {
  _(cont).innerHTML = `
    <p class="animate__animated animate__fadeIn">
      ${msg}
    </p>
  `;
}
