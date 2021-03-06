const querystring = require('querystring');
const https = require('https');
const { stripeKey } = require('../config')
const { StringDecoder } = require('string_decoder');
const { parseJsonToObject } = require('../helpers');
const config = require('../config');

const api ={};


api.charge = async (amount, currency, cardToken, callback) => {
  const payload = {
    amount,
    currency,
    source: cardToken
  }
  const stringPayload = querystring.stringify(payload);

  const requestDetails = {
    'protocol' : 'https:',
    'hostname' : 'api.stripe.com',
    'method' : 'POST',
    'path' : '/v1/charges',
    'auth' : stripeKey,
    'headers' : {
      'Content-Type' : 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(stringPayload)
    }
  };
  
  const req = https.request(requestDetails, res => {
    
    const decoder = new StringDecoder('utf-8');
    let buffer = '';
    
    res.on('data', (data) => buffer += decoder.write(data));
    res.on('end', () => {
      buffer += decoder.end();
      const statusCode = res.statusCode;
      const response = parseJsonToObject(buffer);

      if(statusCode===200 && response.paid)
        callback(false,response);
      else
        callback({error: 'Error during payment.'})
    });
  });

  req.on('error', (e) => {
    callback(e);
  });
  
  req.write(stringPayload);
  req.end();
};


api.sendMail = async (toEmail, subject, mailText, callback) => {

  const payload = {
      from: config.mailgunEmail,
      to: toEmail,
      subject: subject,
      text: mailText
  };

  const stringPayload = querystring.stringify(payload);

  const requestDetails = {
    protocol: 'https:',
    hostname: 'api.mailgun.net',
    method: 'post',
    path: '/v3/sandboxc0b53985fc3a4e74a151baafabc7bd1a.mailgun.org/messages',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(stringPayload),
      Authorization: `Basic ${Buffer.from('api:'+config.mailgunKey, 'utf8').toString('base64')}`
    }
  };

  const req = https.request(requestDetails, (res) => {
    let buffer = '';
    
    res.on('data', (data) => buffer += data);
    res.on('end', () => {
      const statusCode = res.statusCode;
      const response = parseJsonToObject(buffer);
      console.log(response);
      if (statusCode === 200) {
        callback(false, response);
      } else {
        callback({error: 'Sorry, the email may not arrive, we are working on that.'}, response);
      }
    });
  });

  //Bind to the err event so it doesn't get thrown
  req.on('error', function (e) {
    callback(e);
  });

  req.write(stringPayload);
  req.end();
};

module.exports = api;