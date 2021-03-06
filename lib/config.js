/*
 * Create and export configuration variables
 *
 */
const keys = require('./keys');
// Container for all environments
var environments = {};

// Staging (default) environment
environments.staging = {
  httpPort: 3000,
  httpsPort: 3001,
  envName: 'staging',
  hashingSecret: 'thisIsASecret',
  stripeKey: 'sk_test_4eC39HqLyjWDarjtT1zdp7dc',
  mailgunKey: keys.mailgun,
  mailgunEmail: 'henrique@sandboxc0b53985fc3a4e74a151baafabc7bd1a.mailgun.org'
};

// Testing environment
environments.testing = {
  httpPort: 4000,
  httpsPort: 4001,
  envName: 'testing',
  hashingSecret: 'thisIsASecret',
  stripeKey: 'sk_test_4eC39HqLyjWDarjtT1zdp7dc',
  mailgunKey: keys.mailgun,
  mailgunEmail: 'henrique@sandboxc0b53985fc3a4e74a151baafabc7bd1a.mailgun.org'
};

// Production environment
environments.production = {
  httpPort : 5000,
  httpsPort : 5001,
  envName : 'production',
  hashingSecret : 'thisIsAlsoASecret',
  stripeKey: 'sk_test_4eC39HqLyjWDarjtT1zdp7dc',
  mailgunKey: keys.mailgun,
  mailgunEmail: 'henrique@sandboxc0b53985fc3a4e74a151baafabc7bd1a.mailgun.org'
};

// Determine which environment was passed as a command-line argument
var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that the current environment is one of the environments above, if not default to staging
var environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

// Export the module
module.exports = environmentToExport;