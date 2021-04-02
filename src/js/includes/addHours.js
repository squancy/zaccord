// Add n hours to a date string and return a Date
function addHours(dateStr, n) {
  let date = new Date(dateStr);
  return new Date(date.getTime() + n * 1000 * 60 * 60);
}

module.exports = addHours;
