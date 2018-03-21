const https = require('https');
const express = require('express');
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { logger } = require('./util');
const assign = require('./defaults');
const load = require('./loader');
const delay = require('./delay');
const proxy = require('./proxy');
const requireParameter = require('./parameter');
const rawBody = require('./raw-body');
const fileUpload = require('express-fileupload');

/*
 * There are roughly 3 steps to initialize dyson:
 *
 * 1. Load user configurations
 * 2. Create Express server
 * 3. Register configured services with Express
 */

const bootstrap = options => {
  const configs = load(options.configDir);

  const app = createServer({
    https: options.https,
    port: options.port
  });

  return registerServices(app, options, configs);
};

const createServer = (options = {}) => {
  const app = express();

  if (options.https) {
    https.createServer(options.https, app).listen(options.port);
  } else {
    app.listen(options.port);
  }

  return app;
};

const setConfig = config => (req, res, next) => {
  res.locals.config = config;
  next();
};

const installMiddleware = (app, options) => {
  const bodyParserOptions = options.bodyParserJsonLimit ? { limit: options.bodyParserJsonLimit } : {};
  const bodyParserUrlOptions = { extended: true };
  bodyParserUrlOptions.limit = options.bodyParserUrlencodedLimit ? options.bodyParserUrlencodedLimit : null;

  app.use(cors({ origin: true, credentials: true }));
  app.use(rawBody());
  app.use(cookieParser());
  app.use(favicon(`${__dirname}/favicon.ico`));
  app.use(bodyParser.json(bodyParserOptions));
  app.use(bodyParser.urlencoded(bodyParserUrlOptions));
  app.use(fileUpload());

  return app;
};

// Register middleware to Express as service for each config (as in: `app.get(config.path, config.callback);`)
const registerServices = (app, options, configs) => {
  app.set('dyson_logger', logger(options));
  app.set('dyson_options', options);

  const { log, err } = app.get('dyson_logger');

  installMiddleware(app, options);

  configs = assign(configs);

  configs.forEach(config => {
    const method = config.method;
    const isProxied = options.proxy === true && config.proxy !== false;
    if (isProxied) {
      log('Proxying', method.toUpperCase(), 'service at', config.path);
    } else {
      const middlewares = [
        setConfig(config),
        requireParameter,
        config.status,
        config.callback,
        delay(config.delay),
        config.render
      ];

      log('Registering', method.toUpperCase(), 'service at', config.path);
      app[method](config.path, ...middlewares);

      if (method !== 'options') {
        app.options(config.path, cors({ origin: true, credentials: true }));
      }
    }
  });

  if (options.proxy) {
    app.all('*', delay(options.proxyDelay), proxy);
  } else {
    app.all('*', (req, res) => {
      err(`404 NOT FOUND: ${req.url}`);
      res.writeHead(404);
      res.end();
    });
  }

  return app;
};

module.exports = {
  bootstrap,
  createServer,
  registerServices,
  // TODO: deprecated:
  getConfigurations: options => load(options.configDir)
};
