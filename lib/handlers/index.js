const users = require('./users');
const tokens = require('./tokens');
const menu = require('./menu');
const shopping = require('./shopping');
const checkout = require('./checkout');

const index = require('./views')
const usersView = require('./views/users')
const shop = require('./views/shop')

const resources = require('./resources');

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

//VIEWS
handlers.index = index;
handlers.usersView = usersView;
handlers.shop = shop.view;

//RESOURCERS
handlers.favicon = resources.favicon;
handlers.public = resources.public;

module.exports = handlers;