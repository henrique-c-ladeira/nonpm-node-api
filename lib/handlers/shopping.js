const data = require('../data');
const helpers = require('../helpers');


shopping = function (data, callback) {
  const acceptableMethods = ['post', 'get', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    _shopping[data.method](data, callback);
  } else {
    callback(405);
  }
};

module.exports = shopping;