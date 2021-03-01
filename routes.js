const handlers = require('./lib/handlers');

const router = {
  '': handlers.index,
  
  'ping': handlers.ping,

  'api/users': handlers.users,
  'api/tokens': handlers.tokens,
  'api/menu': handlers.menu,
  'api/shopping': handlers.shopping,
  'api/checkout': handlers.checkout,

  'favicon.ico': handlers.favicon,
}

module.exports = router;