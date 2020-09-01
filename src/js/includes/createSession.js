const sessions = require("client-sessions");

// Create session for storing the user's id in a secure way
function createSession(name) { 
  let session = sessions({
    cookieName: name,
    secret: 'niN64LAKu21828jas/!%+()~f?:"!%/dh231JSSlaoos77/%9921Ju21jh',
    duration: 1000 * 60 * 60 * 24 * 365,
    activeDuration: 1000 * 60 * 60 * 24 * 365,
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
