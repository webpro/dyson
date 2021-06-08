const dyson = require('../lib/dyson');

const getService = (config, options = {}) => {
  const app = dyson.createServer(options);
  return config ? dyson.registerServices(app, options, config) : app;
};

module.exports = { getService };
