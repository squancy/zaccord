// Make sure that too large models cannot be printed with SLA
/*
  Remove / add the option for SLA printing when changing the scale of the model
  115 x 65 x 150 mm
*/
function toggleSLAAllowance(scaleContID, cookieIDs, callback, params = null) {
  let scale = Number(_(scaleContID).value); 
  let cartItems = JSON.parse(getCookie('cartItems'));
  let shouldSkip = false;
  for (let id of cookieIDs) {
    let size = cartItems['content_' + id]['size_' + id].split(',').map(x => Number(x) * scale);

    // Disable the option to print with SLA
    if (size[0] > 115 || size[1] > 65 || size[2] > 150) {
      shouldSkip = true;
      break;
    }
  }
  if (params) callback(shouldSkip, ...params);
  else callback(shouldSkip);
}
