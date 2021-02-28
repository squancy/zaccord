// Validate emails with regex
function validateEmail(email) {
  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    return true;
  }
  return false;
}

function regVal(email, pass, passConf, statName, btn) {
  let errStatus = document.getElementById(statName);
  if (!email || !pass || !passConf) {
    errStatus.innerHTML = '<p>Kérlek tölts ki minden mezőt</p>';
    _(btn).disabled = false;
    return false;
  } else if (!validateEmail(email)) {
    errStatus.innerHTML = '<p>Kérlek valós e-mailt adj meg</p>';
    _(btn).disabled = false;
    return false;
  } else if (pass.length < 6) {
    errStatus.innerHTML = '<p>A jelszónak minimum 6 karakterből kell állnia</p>';
    _(btn).disabled = false;
    return false;
  } else if (pass != passConf) {
    errStatus.innerHTML = '<p>A jelszavak nem egyeznek</p>';
    _(btn).disabled = false;
    return false;
  }
  return true;
}
