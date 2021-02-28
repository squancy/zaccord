const sessions = require('client-sessions');
const constants = require('./constants.js');
const SESSION_SECRET = constants.sessionSecret;

// Create session for storing the user's id in a secure way
function createSession(name) { 
  let session = sessions({
    cookieName: name,
    secret: SESSION_SECRET,
    duration: 1000 * 60 * 60 * 24 * 365,
    activeDuration: 1000 * 60 * 60 * 24 * 365,
    cookie: {
      path: '/', 
      maxAge: 1000 * 60 * 60 * 24 * 365, 
      ephemeral: false, 
      httpOnly: true, 
      secure: false 
    }
  });
  return session;
}

module.exports = createSession;
