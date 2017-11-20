import dyson from '../lib/dyson';

export const getService = (config, options = {}) => {
  const app = dyson.createServer(options);
  return config ? dyson.registerServices(app, options, config) : app;
};
