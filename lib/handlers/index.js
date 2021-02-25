const users = require('./users');
const tokens = require('./tokens');
const menu = require('./menu');
const shopping = require('./shopping');
const checkout = require('./checkout');

const handlers = {};

handlers.ping = async (data, callback) => {
  callback(200, { message: 'Hi, do you wanna develop an app?' });
}


handlers.notFound = (data, callback) => {
  callback(404);
}

handlers.users = users;
handlers.tokens = tokens;
handlers.menu = menu;
handlers.shopping = shopping;
handlers.checkout = checkout;

module.exports = handlers;