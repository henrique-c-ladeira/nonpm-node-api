const app = {};

app.config = {
  sessionToken: false,
};

app.setLoggedInClass = function(add){
  const shop = document.querySelector('#shop');
  const login = document.querySelector('#login');
  const logout = document.querySelector('#logout');
  if(add){
    login.classList.add('loggedIn');
    shop.classList.remove('loggedIn');
    logout.classList.remove('loggedIn');
  } else {
    login.classList.remove('loggedIn');
    shop.classList.add('loggedIn');
    logout.classList.add('loggedIn');
  }
};

// Get the session token from localstorage and set it in the app.config object
app.getSessionToken = function(){
  const tokenString = localStorage.getItem('token');
  if(typeof(tokenString) === 'string'){
    try{
      const token = JSON.parse(tokenString);
      app.config.sessionToken = token;
      if(token){
        app.setLoggedInClass(true);
      } else {
        app.setLoggedInClass(false);
      }
    }catch(e){
      app.config.sessionToken = false;
      app.setLoggedInClass(false);
    }
  }
};

app.setSessionToken = function(token){
  app.config.sessionToken = token;
  var tokenString = JSON.stringify(token);
  localStorage.setItem('token',tokenString);
  if(token){
    app.setLoggedInClass(true);
  } else {
    app.setLoggedInClass(false);
  }
};

// Renew the token
// app.renewToken = function(callback){
//   var currentToken = typeof(app.config.sessionToken) == 'object' ? app.config.sessionToken : false;
//   if(currentToken){
//     // Update the token with a new expiration
//     var payload = {
//       'id' : currentToken.id,
//       'extend' : true,
//     };
//     app.client.request(undefined,'api/tokens','PUT',undefined,payload,function(statusCode,responsePayload){
//       // Display an error on the form if needed
//       if(statusCode == 200){
//         // Get the new token details
//         var queryStringObject = {'id' : currentToken.id};
//         app.client.request(undefined,'api/tokens','GET',queryStringObject,undefined,function(statusCode,responsePayload){
//           // Display an error on the form if needed
//           if(statusCode == 200){
//             app.setSessionToken(responsePayload);
//             callback(false);
//           } else {
//             app.setSessionToken(false);
//             callback(true);
//           }
//         });
//       } else {
//         app.setSessionToken(false);
//         callback(true);
//       }
//     });
//   } else {
//     app.setSessionToken(false);
//     callback(true);
//   }
// };

// // Loop to renew token often
// app.tokenRenewalLoop = function(){
//   setInterval(function(){
//     app.renewToken(function(err){
//       if(!err){
//         console.log("Token renewed successfully @ "+Date.now());
//       }
//     });
//   },1000 * 60);
// };

app.client = {};

app.client.request = async (headers, path, method, queryStringObject, payload) => {

  headers = typeof(headers) === 'object' && headers !== null ? headers : {};
  path = path || '/';
  method = method?.toUpperCase() || 'GET';
  queryStringObject = typeof(queryStringObject) === 'object' && queryStringObject !== null ? queryStringObject : {};
  payload = typeof(payload) === 'object' && payload !== null ? payload : {};

  if(app.config.sessionToken){
    headers ={
      ...headers,
      token: app.config.sessionToken};
  }

  isEmptyQueryStringObject = queryStringObject && Object.keys(queryStringObject).length === 0 && queryStringObject.constructor === Object;

  const requestUrl = 
    `${path}${isEmptyQueryStringObject ? '' : '?'}${Object.entries(queryStringObject)
              .map(([key,value],idx) => `${idx ? '&' : ''}${key}=${value}`)}`
              .replaceAll(',','');

  const reqConfig = {
    method,
    headers,
    body: JSON.stringify(payload)
  }
  

  const res = await fetch(requestUrl, reqConfig);
  try {
    return res.json();
  } catch {
    return false;
  }
};

app.login = async (email,password) => {
  res = await app.client.request({Application: 'application/json'},'/api/tokens','POST',undefined,{email,password});
  if(res.id !== '') 
    app.setSessionToken(res.id);
  return res;
}

app.signin = async () => {
  email = document.querySelector('#emailLogin');
  password = document.querySelector('#passwordLogin')
  const res = await app.login(email.value,password.value);
  console.log(res);
  if(!res.Error)
    window.location.pathname = '/shop';
  else
    alert('Invalid Login and/or Password.');
}

app.logout = async () => {
  const res = await app.client.request({Application: 'application/json'},'/api/tokens','DELETE',{id: app.config.sessionToken});
  app.setSessionToken(false);
  window.location.pathname = '/';
}

app.signout = async () => {

}

// Init (bootstrapping)
app.init = function(){

  // Bind all form submissions
  // app.bindForms();

  // // Get the token from localstorage
  app.getSessionToken();

  // // Renew token
  // app.tokenRenewalLoop();

};

window.onload = function(){
  app.init();
};