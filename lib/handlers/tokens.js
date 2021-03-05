const TOKEN_LENGTH = 20;

const _data = require('../data');
const helpers = require('../helpers');

// Tokens
tokens = function (data, callback) {
  const acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    _tokens[data.method](data, callback);
  } else {
    callback(405);
  }
};

// Container for all the tokens methods
const _tokens = {};

// Tokens - post
// Required data: email, password
// Optional data: none
_tokens.post = helpers.safeWrapper(async (data, callback) => {
  const email = typeof (data.payload?.email) == 'string' && data.payload?.email.trim().length > 0
    ? data.payload.email.trim()
    : false;

  const password = typeof (data.payload?.password) == 'string' && data.payload?.password.trim().length > 0
    ? data.payload.password.trim()
    : false;

  if (!(email && password)) return callback(400, { Error: 'Missing required fields.' });

  // Lookup the user who matches that email number
  userData = await _data.read('users', email)
  if (!userData) return callback(400, { Error: 'User does not exist.' });

  // Hash the sent password, and compare it to the password stored in the user object
  const hashedPassword = helpers.hash(password);

  if (hashedPassword !== userData.hashedPassword)
    return callback(400, { 'Error': 'Password did not match the specified user\'s stored password' });

  // If valid, create a new token with a random name. Set an expiration date 1 hour in the future.
  const tokenId = helpers.createRandomString(TOKEN_LENGTH);
  const expires = Date.now() + 1000 * 60 * 60;

  const tokenObject = {
    email,
    id: tokenId,
    expires,
  };

  // Store the token
  await _data.create('tokens', tokenId, tokenObject);
  return callback(200, tokenObject);
});

// Tokens - get
// Required data: id
// Optional data: none
_tokens.get = helpers.safeWrapper(async (data, callback) => {
  // Check that id is valid
  const id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == TOKEN_LENGTH
    ? data.queryStringObject.id.trim()
    : false;
  if (!id)
    return callback(400, { 'Error': 'Missing required field, or field invalid' });

  // Lookup the token
  const tokenData = await _data.read('tokens', id);
  if (!tokenData)
    return callback(404);

  return callback(200, tokenData);

});

// Tokens - put
// Required data: id, extend
// Optional data: none
_tokens.put = helpers.safeWrapper(async (data,callback) => {
  const id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length == TOKEN_LENGTH ? data.payload.id.trim() : false;
  const extend = typeof(data.payload.extend) == 'boolean' && data.payload.extend === true;
  console.log(id,extend)
  if(!(id && extend))
    return callback(400,{"Error": "Missing required field(s) or field(s) are invalid."});
  
  // Lookup the existing token
  const tokenData = await _data.read('tokens',id)
  if(!tokenData)
    return callback(400,{'Error' : 'Specified token does not exist.'});
  
  // Check to make sure the token isn't already expired
  if(tokenData.expires < Date.now())
      return callback(400,{"Error" : "The token has already expired, and cannot be extended."});

  // Set the expiration an hour from now
  tokenData.expires = Date.now() + 1000 * 60 * 60;
  // Store the new updates
  await _data.update('tokens',id,tokenData)
  return callback(200);
});


// Tokens - delete
// Required data: id
// Optional data: none
_tokens.delete = helpers.safeWrapper(async (data, callback) => {
  // Check that id is valid
  const id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == TOKEN_LENGTH
    ? data.queryStringObject.id.trim()
    : false;

  if (!id)
    return callback(400, { 'Error': 'Missing required field' });

  // Lookup the token
  const tokenData = await _data.read('tokens', id,);
  if (!tokenData)
    return callback(400, { 'Error': 'Could not find the specified token.' });

  // Delete the token
  await _data.delete('tokens', id);
  return callback(200);
});

module.exports = tokens;