const _data = require('../data');
const helpers = require('../helpers');


const users = (data, callback) => {
  const acceptableMethods = ['post','get','put','delete'];
  if(acceptableMethods.indexOf(data.method) > -1){
    _users[data.method](data,callback);
  } else {
    callback(405);
  }
};

_users = {};


_users.get = helpers.safeWrapper(async (data,callback) => {
  
    // Check that email number is valid
    const email = data.queryStringObject?.email;
    if(!email) return callback(400,{'Error' : 'Missing required field.'}); 

    if(!(await _data.exists('users',email)))
      return callback(400,{'Error': 'User does not exists.'})

    const {hashedPassword, ...user} = await _data.read('users',email);

    return callback(200,user);
});

  // Get token from headers
  // const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
  // Verify that the given token is valid for the email number
  // handlers._tokens.verifyToken(token,email,function(tokenIsValid){
  //   if(tokenIsValid){
  //     // Lookup the user
  //     _data.read('users',email,function(err,data){
  //       if(!err && data){
  //         // Remove the hashed password from the user user object before returning it to the requester
  //         delete data.hashedPassword;
  //         callback(200,data);
  //       } else {
  //         callback(404);
  //       }
  //     });
  //   } else {
  //     callback(403,{"Error" : "Missing required token in header, or token is invalid."})
  //   }
  // });

_users.post = helpers.safeWrapper(async (data,callback) => {
  // Check that all required fields are filled out
  const firstName = typeof(data.payload?.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  const lastName = typeof(data.payload?.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  const email = typeof(data.payload?.email) == 'string' && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;
  const password = typeof(data.payload?.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
  const tosAgreement = typeof(data.payload?.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

  if(!(firstName && lastName && email && password && tosAgreement))
    return callback(400,{'Error' : 'Missing required fields'});


  // Make sure the user doesnt already exist
  if(await _data.exists('users',email))
    return callback(400,{'Error' : 'A user with that email number already exists'});

  // Hash the password
  const hashedPassword = helpers.hash(password);
  if(!hashedPassword) throw new Error();

  const userObject = {
    'firstName' : firstName,
    'lastName' : lastName,
    'email' : email,
    'hashedPassword' : hashedPassword,
    'tosAgreement' : true
  };

  // Store the user
  await _data.create('users',email,userObject);
  return callback(200);
});

_users.put = helpers.safeWrapper(async (data,callback) => {
  // Check for required field
  const email = typeof(data.payload?.email) == 'string' && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;

  // Check for optional fields
  const firstName = typeof(data.payload?.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  const lastName = typeof(data.payload?.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  const password = typeof(data.payload?.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

  if(!email)
    return callback(400,{'Error' : 'Missing required field.'});

  if(!(firstName || lastName || password))
    return callback(400,{'Error' : 'Missing fields to update.'});

  const userData = await _data.read('users',email);
  if(firstName) userData.firstName = firstName;
  if(lastName) userData.lastName = lastName;
  if(password) userData.hashedPassword = helpers.hash(password);

  await _data.update('users',email,userData);
  return callback(200);
});

_users.delete = helpers.safeWrapper(async (data, callback) => {
  const email = typeof(data.queryStringObject?.email) == 'string' && data.queryStringObject.email.trim().length == 10 ? data.queryStringObject.email.trim() : false;
  if(!email) return callback(400,{'Error' : 'Missing required field.'});

  await _data.delete('users',email)
  return callback(200);
});

  // // Get token from headers
  // const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

  // // Verify that the given token is valid for the email number
  // handlers._tokens.verifyToken(token,email,function(tokenIsValid){
  //   if(tokenIsValid){

  //     // Lookup the user
  //     _data.read('users',email,function(err,userData){
  //       if(!err && userData){
  //         // Update the fields if necessary
  //         if(firstName){
  //           userData.firstName = firstName;
  //         }
  //         if(lastName){
  //           userData.lastName = lastName;
  //         }
  //         if(password){
  //           userData.hashedPassword = helpers.hash(password);
  //         }
  //         // Store the new updates
  //         _data.update('users',email,userData,function(err){
  //           if(!err){
  //             callback(200);
  //           } else {
  //             callback(500,{'Error' : 'Could not update the user.'});
  //           }
  //         });
  //       } else {
  //         callback(400,{'Error' : 'Specified user does not exist.'});
  //       }
  //     });
  //   } else {
  //     callback(403,{"Error" : "Missing required token in header, or token is invalid."});
  //   }
  // });



module.exports = users;