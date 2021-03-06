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

  const isEmptyQueryStringObject = queryStringObject && Object.keys(queryStringObject).length === 0 && queryStringObject.constructor === Object;

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
  await app.client.request({ Application: 'application/json' },
        '/api/tokens',
        'DELETE',
        { id: app.config.sessionToken });

  app.setSessionToken(false);
  window.location.pathname = '/';
}

app.addItem = async (event) => {
  const shoppingView = document.querySelector('#shopping-cart');
  if (!shoppingView) return;

  const item = event.id;

  const token = await app.client.request({ Application: 'application/json' },
                '/api/tokens',
                'GET',
                { id: app.config.sessionToken });

  const email = token.email;

  const res = await app.client.request({ Application: 'application/json' },
            '/api/shopping',
            'POST',
            undefined,
            { email, item });
  
  const cartResponse = await app.client.request({ Application: 'application/json' },
              '/api/shopping',
              'GET',{email});
  shoppingView.textContent = '';
  
  app.createCartList(cartResponse, shoppingView);

}

app.loadItens = async () => {
  const shoppingView = document.querySelector('#shopping-cart');
  if (!shoppingView) return;
  
  const token = await app.client.request({ Application: 'application/json' },
                '/api/tokens',
                'GET',
                { id: app.config.sessionToken });

  const email = token.email;
  
  const cartResponse = await app.client.request({ Application: 'application/json' },
              '/api/shopping',
              'GET',{email});
  
  app.createCartList(cartResponse, shoppingView);

};

app.deleteItem = async (event) => {
  const shoppingView = document.querySelector('#shopping-cart');
  if (!shoppingView) return;

  const item = event.id;

  const token = await app.client.request({ Application: 'application/json' },
                '/api/tokens',
                'GET',
                { id: app.config.sessionToken });

  const email = token.email;
  
  const cartResponse = await app.client.request({ Application: 'application/json' },
  '/api/shopping',
  'DELETE',undefined,{email, item});
  
  shoppingView.textContent = '';
  app.createCartList(cartResponse, shoppingView);
  
}

app.createCartList = (cartResponse, shoppingView) => {
  shoppingView.classList.add('has-text-centered');
  shoppingView.classList.add('columns');
  shoppingView.classList.add('is-multiline');
  const total = Object.values(cartResponse).filter((notNull) => notNull?.price).reduce(((sum,cur) => { 
    return (sum + cur.price);
  }),0);

  const totalNode = document.getElementById('total');
  totalNode.textContent = '';
  totalNode.classList.add('subtitle')
  const totalText = document.createTextNode(`TOTAL - $${(total/100).toFixed(2)}`);
  totalNode.appendChild(totalText);
  

  Object.values(cartResponse).filter((notNull) => notNull?.name).map((item) => {

    const element = document.createElement('div');
    element.classList.add('card');
    element.classList.add('p-2');
    element.classList.add('column');
    const div = document.createElement('div');
    const textItem = document.createTextNode(`${item.name} - $${(item.price/100).toFixed(2)}`);
    div.appendChild(textItem);
    element.appendChild(div);
    
    const button = document.createElement('button');
    button.addEventListener('click', () => app.deleteItem(button));
    button.setAttribute('id', item.name);
    button.classList.add('button');
    button.classList.add('is-danger');
    button.classList.add('p-1');
    const textButton = document.createTextNode('delete');
    button.appendChild(textButton);



    element.appendChild(button);
    shoppingView.appendChild(element);
  })

};

app.mountCard = async () => {
  const isCard = document.querySelector('#card-element');
  if (!isCard) return;
  const token = await app.client.request({ Application: 'application/json' },
                '/api/tokens',
                'GET',
                { id: app.config.sessionToken });

  const email = token.email;
  const stripe = Stripe('pk_test_TYooMQauvdEDq54NiTphI7jx');
  const elements = stripe.elements();
  const style = {
    base: {
      // Add your base input styles here. For example:
      fontSize: '16px',
      color: '#32325d',
    },
  };

  // Create an instance of the card Element.
  const card = elements.create('card', {style: style});
  // Add an instance of the card Element into the `card-element` <div>.
  card.mount('#card-element');


  const form = document.getElementById('payment-form');
  form.addEventListener('submit', function(event) {
    event.preventDefault();
    

    stripe.createToken(card).then(async function(result) {
      if (result.error) {
        // Inform the customer that there was an error.
        const errorElement = document.getElementById('card-errors');
        errorElement.textContent = result.error.message;
      } else {
        const textItem = document.createTextNode('Processing payment...');
        form.appendChild(textItem);
        // Send the token to your server.
        await app.client.request({ Application: 'application/json' },
            '/api/checkout',
            'POST',
            undefined,
            { email, cardToken: result.token.id });
        alert("Payment Done! I think.... Maybe you should check your email.");
        window.location = '/shop';
      }
    });
  });

}


// Init (bootstrapping)
app.init = () => {


  // Get the token from localstorage
  app.getSessionToken();
  app.renewToken()
  // Renew token
  app.tokenRenewalLoop();
  app.loadItens(); 
  app.mountCard();
};

window.onload = function(){
  app.init();
};