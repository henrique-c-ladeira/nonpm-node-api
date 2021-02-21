const _data = require('../data');
const { safeWrapper } = require('../helpers');

const menu = (data, callback) => {
  const acceptableMethods = ['get'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    _menu[data.method](data, callback);
  } else {
    callback(405);
  }
};

const isTokenValid = async (id) => {
  // Lookup the token
  tokenData = await _data.read('tokens', id);
  if (!tokenData) {
    return false;
  }
  // Check that the token is for the given user and has not expired
  if (tokenData.expires > Date.now()) {
    return true;
  }
  else {
    return false;
  }
};

_menu = {};

_menu.get = safeWrapper(async (data, callback) => {
  // Get token from headers
  const token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
  //Verify that the given token is valid for the email number
  const tokenIsValid = await isTokenValid(token);
  if (!tokenIsValid)
    return callback(403, { "Error": "Missing required token in header, or token is invalid." });

  const menuData = await _data.read('', 'menu');
  console.log(menuData);

  callback(200, menuData);


});



module.exports = menu;