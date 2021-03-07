const readline = require('readline');
const { debuglog } = require('util');
const events = require('events');
const _data = require('../data');

class _events extends events{};
const e = new _events();

e.on('help', (str) => {
  cli.responders.help(str);
})

e.on('man', (str) => {
  cli.responders.help(str);
})

e.on('list users', (str) => {
  cli.responders.listUsers(str);
})

e.on('list orders', (str) => {
  cli.responders.listOrders(str);
})

e.on('list menu', (str) => {
  cli.responders.listMenu(str);
})

e.on('exit', (str) => {
  cli.responders.exit(str);
})

const cli = {};

cli.responders = {}

cli.responders.listOrders = async (str) => {
  console.log('I am working on that.\n');

  const ordersName = await _data.readDir('orders');

  const orders = await Promise.all(ordersName.map(async (file,idx) => {
    const order = await _data.read('orders',file.name);
    return {...order, idx}
  }));

  const recentOrders = orders.filter(elem => elem?.created > (Date.now() - (24 * 60 * 60 * 60 * 1000)))
  const recentOrdersName = recentOrders.map((elem,idx) => { return{idx, email: elem.email}})

  const args = str.split('-')[1];
  if(args){
    console.log('\n');
    console.table(recentOrders[args])
  }
  else {
    console.log('\n');
    console.table(recentOrdersName);
  }
}

cli.responders.listUsers = async (str) => {
  console.log('I am working on that.');

  const usersName = await _data.readDir('users');

  const users = await Promise.all(usersName.map(async (file) => {
    const user = await _data.read('users',file.name);
    return user;
  }));

  const args = str.split('-')[1];
  if(args){
    console.log('\n');
    console.table(users[args])
  }
  else {
    console.log('\n');
    console.table(usersName);
  }
}

cli.responders.listMenu = async (str) => {
  console.log('I am working on that.');

  const menu = await _data.read('','menu');
  console.log('\n');
  console.table(menu);

}

cli.responders.exit = (str) => {
  console.log('\x1b[31m%s\x1b[0m','Oh no, you killed me.');
  process.exit(0);
}


cli.responders.help = (str) => {
  const commands = {
    'help': 'Show this table.',
    'man': 'Alias, its the same as help. Just show this table.',
    'list orders -id[optional]': 'list recent orders or list orders details if id provided. Ex.: list orders -2',
    'list users -id[optional]': 'list users or list users details if id provided. Ex.: list users -0',
    'list menu': 'Show all the menu items.',
    'exit': 'Kill everything, show no mercy.'
  }
  console.table(commands);
}


cli.processInput = (str) => {
  str = typeof(str) === 'string' && str.trim().length > 0
                        ? str.trim()
                        : false;

  if(!str) return;

  const uniqueInputs = [
    'help',
    'man',
    'list orders',
    'list users',
    'list menu',
    'exit'
  ];

  matchFound = uniqueInputs.some((input) => {
    if(str.startsWith(input)) {
      e.emit(input,str);
      return str.startsWith(input);
    }
  });
  if (!matchFound) return console.log(`Could not find command "${str}".`);

}

cli.init = () => {
  console.log('\x1b[34m%s\x1b[0m','CLI engines running.')

  const _interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '\x1b[34m> \x1b[0m'
  });

  _interface.prompt();

  _interface.on('line', (str) => {
    cli.processInput(str);

    _interface.prompt();
  });

  _interface.on('close', () => {
    process.exit(0);
  });
};

module.exports = cli;