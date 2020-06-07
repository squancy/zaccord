function escapeVars(str) {
  return String(str).replace(/"/g, '\\"').replace(/'/g, "\\'");
}

module.exports = escapeVars;
