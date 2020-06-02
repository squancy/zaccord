const sessions = require("client-sessions");

function createSession(name) { 
  let session = sessions({
    cookieName: name,
    secret: 'niN64LAKu21828jas/!%+()~f?:"!%/dh231JSSlaoos77/%9921Ju21jh',
    duration: 24 * 60 * 60 * 1000,
    activeDuration: 1000 * 60 * 5,
    cookie: {
      path: '/', 
      maxAge: 1000 * 60 * 60 * 24 * 365, 
      ephemeral: false, 
      httpOnly: true, 
      // TODO: change to true when on production
      secure: false 
    }
  });
  return session;
}

module.exports = createSession;
