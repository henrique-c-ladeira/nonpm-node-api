const http = require('http');
const { parse } = require('path');
const { StringDecoder } = require('string_decoder');
const url = require('url');
const handlers = require('./lib/handlers');
const helpers = require('./lib/helpers');

const server = http.createServer(async (req, res) => {

  const method = req.method.toLowerCase();
  const headers = req.headers;

  var baseURL = `http://${req.headers.host}/`;
  const parsedUrl = new URL(req.url, baseURL);
  const trimmedPath = parsedUrl.pathname.replace(/^\/+|\/+$/g, '');

  const queryStringObject = {};
  parsedUrl.searchParams.forEach((value, name) => {
    queryStringObject[name] = value;
  });


  const decoder = new StringDecoder('utf-8');
  let buffer = '';
  req.on('data', (data) => buffer += decoder.write(data));
  req.on('end', () => {
    buffer += decoder.end();
    const payload = helpers.parseJsonToObject(buffer);

    const chosenHandler = typeof (router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;


    const data = {
      trimmedPath,
      queryStringObject,
      method,
      headers,
      payload,
    };

    chosenHandler(data, (statusCode, payload) => {
      statusCode = typeof (statusCode) == 'number' ? statusCode : 200;
      payload = typeof (payload) == 'object' ? payload : {};
      const payloadString = JSON.stringify(payload);

      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);
      console.log(trimmedPath, method, statusCode);
    });

  });

});

server.listen(3000, () => console.log("Oh GEE I'm up!"));

router = {
  ping: handlers.ping,
  users: handlers.users,
  tokens: handlers.tokens,
  menu: handlers.menu,
  shopping: handlers.shopping,
  checkout: handlers.checkout,
}