import dyson from '../lib/dyson';

const logger = {
  log: () => {},
  err: () => {}
};

export const getService = (config, options = {}) => {
  const app = dyson.createServer(options);
  app.set('dyson_options', options);
  app.set('dyson_logger', logger);
  return config ? dyson.registerServices(app, options, config) : app;
};
