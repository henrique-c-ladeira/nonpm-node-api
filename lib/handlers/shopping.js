const _data = require('../data');
const { safeWrapper } = require('../helpers');
const { verifyToken } = require('./_auth');


shopping = function (data, callback) {
  const acceptableMethods = ['post', 'get', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    _shopping[data.method](data, callback);
  } else {
    callback(405);
  }
};

const _shopping = {};

_shopping.get = safeWrapper(async (data, callback) => {
  const email = data.queryStringObject?.email;
  if (!email) 
    return callback(400, { 'Error': 'Missing required field.' });

  if (!(await _data.exists('users', email)))
    return callback(400, { 'Error': 'User does not exists.' })

  // Get token from headers
  const token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
  const tokenIsValid = await verifyToken(token, email);

  if (!tokenIsValid)
    return callback(403, { 'Error': 'Missing required token in header, or token is invalid.' });

  const cart = await _data.read('carts', email);

  return callback(200, cart);
});

_shopping.post = safeWrapper( async(data, callback) => {
    // Check that all required fields are filled out
    const email = typeof (data.payload?.email) == 'string' && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;
    const item = typeof (data.payload?.item) == 'string' && data.payload.item.trim().length > 0 ? data.payload.item.trim() : false;
  
    // Get token from headers
    const token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
    const tokenIsValid = await verifyToken(token, email);
    
    if (!(email && item))
      return callback(400, { 'Error': 'Missing required fields' });
    
    if (!tokenIsValid)
      return callback(403, { 'Error': 'Missing required token in header, or token is invalid.' });
  
    const menu = await _data.read('','menu');
    const searchResult = menu.find((elem) => elem.name === item);

    if (!searchResult)
      return callback(400, {'Error': 'There is no such thing as a invalid item, Morty. It is about execution'});

    const userCart = await _data.read('carts',email);
    if (!userCart) userCart = {};
    
    await userCart.push(searchResult);
    
    await _data.update('carts',email, userCart);

    return callback(200, userCart);
});

_shopping.delete = safeWrapper( async(data, callback) => {
  // Check that all required fields are filled out
  const email = typeof (data.payload?.email) == 'string' && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;
  const item = typeof (data.payload?.item) == 'string' && data.payload.item.trim().length > 0 ? data.payload.item.trim() : false;

  // Get token from headers
  const token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
  const tokenIsValid = await verifyToken(token, email);
  
  if (!(email && item))
    return callback(400, { 'Error': 'Missing required fields' });
  
  if (!tokenIsValid)
    return callback(403, { 'Error': 'Missing required token in header, or token is invalid.' });

  const menu = await _data.read('','menu');
  const searchResult = menu.filter((elem) => elem.name === item);

  if (!searchResult.length)
    return callback(400, {'Error': 'There is no such thing as a invalid item, Morty. It is about execution'});

  const userCart = await _data.read('carts',email);
  const deletedItemUserCart = userCart.filter((elem)=> elem.name !== item);
  await _data.update('carts',email, deletedItemUserCart);

  return callback(200, deletedItemUserCart);
});

module.exports = shopping;