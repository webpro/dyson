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
    util.options.set(options);
    const rawConfigs = loader.load(options.configDir);

    return defaults.assignToAll(rawConfigs);
};

const createServer = options => {
    const app = express();

    if(options.https) {
        https.createServer(options.https, app).listen(options.port);
    } else {
        app.listen(options.port);
    }

    return app;
};

// Register middleware to Express as service for each config (as in: `app.get(config.path, config.callback);`)
const registerServices = (app, options, configs) => {
    const request = express();
    request.use(rawBody());
    request.use(favicon(`${__dirname}/favicon.ico`));
    if(options.bodyParserJsonLimit) {
        request.use(bodyParser.json({ limit: options.bodyParserJsonLimit }));
    } else {
        request.use(bodyParser.json());
    }
    if(options.bodyParserUrlencodedLimit) {
        request.use(bodyParser.urlencoded({ limit: options.bodyParserUrlencodedLimit, extended: true }));
    } else {
        request.use(bodyParser.urlencoded({ extended: true }));
    }
    request.use(cookieParser());
    request.use(cors({ origin: true, credentials: true }));
    Object.keys(configs).forEach(method => {
        configs[method].forEach(config => {
            if(options.proxy === true && config.proxy !== false) {
                // Allows each config file to be bypassed without removing it
                util.log('Proxying', method.toUpperCase(), 'service at', config.path);
            } else {
                const middlewares = [
                    request,
                    (req, res, next) => {
                        res.locals.config = config;
                        next();
                    },
                    requireParameter,
                    config.callback,
                    delay,
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
        app.all('*', delay.middleware.bind(null, options.proxyDelay), proxy.middleware);
    } else {
        !util.isTest() && app.all('*', function(req, res) {
            util.error(`404 NOT FOUND: ${req.url}`);
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
