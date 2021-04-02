// Format a date to 'YYYY-MM-DD HH-MM-SS'
function EUDateFormat(date) {
  let year = date.getFullYear();
  let month = String(date.getMonth() + 1).padStart(2, '0');
  let day = String(date.getDate()).padStart(2, '0');
  let hour = String(date.getHours()).padStart(2, '0');
  let minute = String(date.getMinutes()).padStart(2, '0');
  let seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hour}:${minute}:${seconds}`;
}

module.exports = EUDateFormat;
