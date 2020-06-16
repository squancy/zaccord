const sessions = require("client-sessions");

// Create session for storing the user's id in a secure way
function createSession(name) { 
  let session = sessions({
    cookieName: name,
    secret: `[-Bzz,cFk7vW5w?g.'snnhb_<Qq:]\QpZ'^])bEw<<:3z!V{/Lt}/er`,
    duration: 1000 * 60 * 60 * 24 * 365,
    activeDuration: 24 * 60 * 60 * 1000,
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
