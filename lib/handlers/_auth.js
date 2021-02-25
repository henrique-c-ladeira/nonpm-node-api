const _data = require('../data');

const auth = {};

// Verify if a given token id is currently valid for a given user
auth.verifyToken = async (id, email) => {
  // Lookup the token
  tokenData = await _data.read('tokens', id);
  if (!tokenData) {
    return false;
  }
  // Check that the token is for the given user and has not expired
  if (tokenData.email === email && tokenData.expires > Date.now()) {
    return true;
  }
  else {
    return false;
  }
};

module.exports = auth;