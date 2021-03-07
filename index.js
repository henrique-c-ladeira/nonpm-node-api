const server = require('./lib/server');
const cli = require('./lib/cli');

app = {};

app.init = () => {
  server.listen(3000, () => console.log("Oh GEE I'm up!"));

  setTimeout(() => cli.init(),50);
}

app.init();