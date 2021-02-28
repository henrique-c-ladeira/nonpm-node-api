const _data = require('../data');
const { safeWrapper, hash } = require('../helpers');
const { verifyToken } = require('./_auth');


const users = (data, callback) => {
  const acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    _users[data.method](data, callback);
  } else {
    callback(405);
  }
};


const _users = {};


_users.get = safeWrapper(async (data, callback) => {

  // Check that email number is valid
  const email = data.queryStringObject?.email;
  if (!email) return callback(400, { 'Error': 'Missing required field.' });

  if (!(await _data.exists('users', email)))
    return callback(400, { 'Error': 'User does not exists.' })

  // Get token from headers
  const token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
  //Verify that the given token is valid for the email number
  const tokenIsValid = await verifyToken(token, email);
  if (!tokenIsValid)
    return callback(403, { "Error": "Missing required token in header, or token is invalid." });

  const { hashedPassword, ...user } = await _data.read('users', email);

  return callback(200, user);
});


_users.post = safeWrapper(async (data, callback) => {
  // Check that all required fields are filled out
  const name = typeof (data.payload?.name) == 'string' && data.payload.name.trim().length > 0 ? data.payload.name.trim() : false;
  const address = typeof (data.payload?.address) == 'string' && data.payload.address.trim().length > 0 ? data.payload.address.trim() : false;
  const email = typeof (data.payload?.email) == 'string' && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;
  const password = typeof (data.payload?.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
  const tosAgreement = typeof (data.payload?.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

  if (!(name && address && email && password && tosAgreement))
    return callback(400, { 'Error': 'Missing required fields' });


  // Make sure the user doesnt already exist
  if (await _data.exists('users', email))
    return callback(400, { 'Error': 'A user with that email number already exists' });

  // Hash the password
  const hashedPassword = hash(password);
  if (!hashedPassword) throw new Error();

  const userObject = {
    name,
    address,
    email,
    hashedPassword,
    tosAgreement: true
  };

  // Store the user
  await _data.create('users', email, userObject);
  await _data.create('carts', email, []);
  return callback(200);
});

_users.put = safeWrapper(async (data, callback) => {
  // Check for required field
  const email = typeof (data.payload?.email) == 'string' && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;

  // Check for optional fields
  const name = typeof (data.payload?.name) == 'string' && data.payload.name.trim().length > 0 ? data.payload.name.trim() : false;
  const address = typeof (data.payload?.address) == 'string' && data.payload.address.trim().length > 0 ? data.payload.address.trim() : false;
  const password = typeof (data.payload?.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

  if (!email)
    return callback(400, { 'Error': 'Missing required field.' });

  if (!(name || address || password))
    return callback(400, { 'Error': 'Missing fields to update.' });

  // Get token from headers
  const token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
  //Verify that the given token is valid for the email number
  const tokenIsValid = await verifyToken(token, email);
  if (!tokenIsValid)
    return callback(403, { "Error": "Missing required token in header, or token is invalid." });


  const userData = await _data.read('users', email);
  if (name) userData.name = name;
  if (address) userData.address = address;
  if (password) userData.hashedPassword = hash(password);

  await _data.update('users', email, userData);
  return callback(200);
});

_users.delete = safeWrapper(async (data, callback) => {
  const email = data?.queryStringObject?.email;//typeof (data.queryStringObject?.email) == 'string' && data.queryStringObject.email.trim().length == 10 ? data.queryStringObject.email.trim() : false;
  if (!email) return callback(400, { 'Error': 'Missing required field.' });

  // Get token from headers
  const token = data?.headers?.token; //typeof (data.headers.token) == 'string' ? data.headers.token : false;
  //Verify that the given token is valid for the email number
  const tokenIsValid = await verifyToken(token, email);
  if (!tokenIsValid)
    return callback(403, { "Error": "Missing required token in header, or token is invalid." });

    await _data.delete('users', email)
    await _data.delete('carts', email)
    return callback(200);
});


module.exports = users;