const http = require('http');
const { StringDecoder } = require('string_decoder');
const handlers = require('../handlers');
const helpers = require('../helpers');
const { setContentString } = require('./_lib.js');

const router = require('../../routes');

const server = http.createServer(async (req, res) => {

  const method = req.method.toLowerCase();
  const headers = req.headers;

  const baseURL = `http://${req.headers.host}/`;
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
    const chosenHandler =  trimmedPath.indexOf('public/') > -1 ? handlers.public : router[trimmedPath] ?? handlers.notFound;

    const data = {
      trimmedPath,
      queryStringObject,
      method,
      headers,
      payload,
    };

    chosenHandler(data, (statusCode, payload, contentType) => {
      statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
      contentType = typeof(contentType) === 'string' ? contentType : 'json';
      const { payloadString , contentTypeString } = setContentString(payload,contentType);
      res.setHeader('Content-Type', contentTypeString);
      res.writeHead(statusCode);

      res.end(payloadString);

      console.log(trimmedPath, method, statusCode);
    });

  });

});

module.exports = server;