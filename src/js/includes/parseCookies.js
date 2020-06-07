// Convert cookies into a usable structure
function parseCookies(request) {
  var list = {}, rc = request.headers.cookie;

  rc && rc.split(';').forEach(function(cookie) {
    var parts = cookie.split('=');
    list[parts.shift().trim()] = decodeURI(parts.join('='));
  });

  return list;
}

module.exports = parseCookies;
