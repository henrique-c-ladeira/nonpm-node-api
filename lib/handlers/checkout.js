const _data = require('../data');
const { safeWrapper } = require('../helpers');

const checkout = (data, callback) => {
  const acceptableMethods = ['post'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    _checkout[data.method](data, callback);
  } else {
    callback(405);
  }
};

_checkout = {};

_checkout.post = safeWrapper(async (data, callback) => {
  
})

module.exports = checkout;