const app = {};

app.init = () => console.log('Hi there!');

app.config = {
  sessionToken: false,
};

app.client = {};

app.client.request = async (headers, path, method, queryStringObject, payload) => {

  headers = typeof(headers) === 'object' && headers !== null ? headers : {};
  path = path || '/';
  method = method || 'GET';
  queryStringObject = typeof(queryStringObject) === 'object' && queryStringObject !== null ? headers : {};
  payload = typeof(payload) === 'object' && payload !== null ? headers : {};

  const requestUrl = 
    `${path}?${Object.entries(queryStringObject)
              .map(([key,value],idx) => `${idx ? '&' : ''}${key}=${value}`)}`
              .replaceAll(',','');
  console.log(requestUrl);

  const xhr = new XMLHttpRequest();
};


app.init();