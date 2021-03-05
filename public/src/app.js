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
  app.config.sessionToken = token
  var tokenString = JSON.stringify(token);
  localStorage.setItem('token',tokenString);
  if(token){
    app.setLoggedInClass(true);
  } else {
    app.setLoggedInClass(false);
  }
};

// Renew the token
app.renewToken = async () => {
  const currentToken = app.config.sessionToken;
  if(!currentToken) {
    app.setSessionToken(false);
    return false;
  }

  const payload = {
    id : currentToken,
    extend : true,
  };

  const res = await app.client.request(undefined,'api/tokens','PUT',undefined,payload);
  if(res.statusCode !== 200) {
    app.setSessionToken(false);
    return false;
  }
  // Get the new token details
  const queryStringObject = {'id' : currentToken};
  const resRead = await app.client.request(undefined,'api/tokens','GET',queryStringObject,undefined);
  // Display an error on the form if needed
  if(resRead.statusCode !== 200) {
    app.setSessionToken(false);
    return false;
  }
  app.setSessionToken(resRead.id);
  return true;
};

// Loop to renew token often
app.tokenRenewalLoop = () => {
  setInterval(async () => {
    const isRenewed = await app.renewToken();
    if(isRenewed)
      console.log("Token renewed successfully @ "+Date.now());
  },1000 * 60);
};


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
  }
  
  if(!(Object.keys(payload).length === 0 && payload.constructor === Object))
    reqConfig.body = JSON.stringify(payload);

  const res = await fetch(requestUrl, reqConfig);
  try {
    const data = await res.json();
    return { ...data, statusCode: res.status }
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
  const res = await app.client.request({ Application: 'application/json' },
                                        '/api/tokens',
                                        'DELETE',
                                        { id: app.config.sessionToken });
  app.setSessionToken(false);
  window.location.pathname = '/';
}

app.signout = async () => {

}

// Init (bootstrapping)
app.init = function(){


  // // Get the token from localstorage
  app.getSessionToken();

  // // Renew token
  app.tokenRenewalLoop();

};

window.onload = function(){
  app.init();
};