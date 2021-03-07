const server = require('./lib/server');
const cli = require('./lib/cli');
const config = require('./lib/config');
const cluster = require('cluster');
const os = require('os');

app = {};

app.init = () => {
  if(process.env.NODE_ENV === 'testing') 
    return server.listen(config.httpPort, () => console.debug("Oh GEE I'm up!"));
    
  if(cluster.isMaster) {
    setTimeout(() => cli.init(),150);
    os.cpus().forEach(() => cluster.fork());
  } else {
    server.listen(config.httpPort, () => console.debug("Oh GEE I'm up!"));
  }

}

if(require.main === module)
  app.init();

module.exports = app;