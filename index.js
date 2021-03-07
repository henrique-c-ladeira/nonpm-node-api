const server = require('./lib/server');
const cli = require('./lib/cli');
const config = require('./lib/config');

app = {};

app.init = () => {
  server.listen(config.httpPort, () => console.debug("Oh GEE I'm up!"));

  setTimeout(() => cli.init(),50);
}

if(require.main === module)
  app.init();

module.exports = app;