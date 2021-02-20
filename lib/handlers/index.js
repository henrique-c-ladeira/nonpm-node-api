const users = require('./users');
const tokens = require('./tokens');

const handlers = {};

handlers.ping = async (data,callback) => {
  callback(200, {message: 'Hi, do you wanna develop an app?'});
}


handlers.notFound = (data,callback) => {
  callback(404);
}

handlers.users = users;

handlers.tokens = tokens;

module.exports = handlers;