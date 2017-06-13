const https = require('https'),
  express = require('express'),
  favicon = require('serve-favicon'),
  bodyParser = require('body-parser'),
  cookieParser = require('cookie-parser'),
  cors = require('cors'),
  rawBody = require('./raw-body'),
  loader = require('./loader'),
  defaults = require('./defaults'),
  delay = require('./delay'),
  proxy = require('./proxy'),
  util = require('./util'),
  requireParameter = require('./parameter');

/*
 * There are roughly 3 steps to initialize dyson:
 *
 * 1. Load user configurations + mix-in defaults
 * 2. Create Express server
 * 3. Register configured services with Express
 */
const bootstrap = options => {
  const configs = getConfigurations(options);
  const app = createServer(options);
  return registerServices(app, options, configs);
};

const getConfigurations = options => {
  const rawConfigs = loader.load(options.configDir);

  return defaults.assignToAll(rawConfigs);
};

const createServer = options => {
  const app = express();
  let server;

  if(options.https) {
    server = https.createServer(options.https, app).listen(options.port);
  } else {
    server = app.listen(options.port);
  }

  app.set('dyson_server', server);
  return app;
};

const setConfig = config => (req, res, next) => {
  res.locals.config = config;
  next();
};

// Register middleware to Express as service for each config (as in: `app.get(config.path, config.callback);`)
const registerServices = (app, options, configs) => {

  app.set('dyson_options', options);
  util.setQuiet(options.quiet);

  app.use(cors({ origin: true, credentials: true }));
  app.use(rawBody());
  app.use(cookieParser());
  app.use(favicon(`${__dirname}/favicon.ico`));

  const bodyParserOptions = options.bodyParserJsonLimit ? { limit: options.bodyParserJsonLimit } : {};
  app.use(bodyParser.json(bodyParserOptions));

  const bodyParserUrlOptions = { extended: true };
  bodyParserUrlOptions.limit = options.bodyParserUrlencodedLimit ? options.bodyParserUrlencodedLimit : null;
  app.use(bodyParser.urlencoded(bodyParserUrlOptions));

  Object.keys(configs).forEach(method => {

    configs[method].forEach(config => {

      if(options.proxy === true && config.proxy !== false) {

        // Allows each config file to be bypassed without removing it
        util.log('Proxying', method.toUpperCase(), 'service at', config.path);

      } else {

        const middlewares = [
          setConfig(config),
          requireParameter,
          config.status,
          config.callback,
          delay(config.delay),
          config.render
        ];

        util.log('Registering', method.toUpperCase(), 'service at', config.path);
        app[method].apply(app, [config.path].concat(middlewares));

        if(method !== 'options') {
          app.options(config.path, cors({ origin: true, credentials: true }));
        }
      }
    });
  });

  if(options.proxy) {

    app.all('*', delay(options.proxyDelay), proxy.middleware);

  } else {

    !util.isTest() && app.all('*', (req, res) => {
      /* eslint-disable no-console */
      console.error(`404 NOT FOUND: ${req.url}`);
      res.writeHead(404);
      res.end();
    });
  }

  return app;
};

module.exports = {
  bootstrap,
  getConfigurations,
  createServer,
  registerServices
};
