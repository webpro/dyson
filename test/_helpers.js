import dyson from '../lib/dyson';
import { logger } from '../lib/util';

export const getService = (config, options = {}) => {
  const app = dyson.createServer(options);
  app.set('dyson_options', options);
  app.set('dyson_logger', logger({ quiet: true }));
  return config ? dyson.registerServices(app, options, config) : app;
};
