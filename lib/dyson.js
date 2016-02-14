var path = require('path'),
    https = require('https'),
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

var bootstrap = function(options) {

    var configs = getConfigurations(options);

    var app = createServer(options);

    return registerServices(app, options, configs);

};

var getConfigurations = function(options) {

    util.options.set(options);

    var rawConfigs = loader.load(options.configDir);

    return defaults.assignToAll(rawConfigs);
};

var createServer = function(options) {

    var app = express();

    if(options.https) {
        https.createServer(options.https, app).listen(options.port);
    } else {
        app.listen(options.port);
    }

    return app;
};

// Register middleware to Express as service for each config (as in: `app.get(config.path, config.callback);`)

var registerServices = function(app, options, configs) {

    var request = express();
    request.use(rawBody());
    request.use(favicon(__dirname + '/favicon.ico'));
    if(options.bodyParserJsonLimit) {
        request.use(bodyParser.json({limit: options.bodyParserJsonLimit}));
    } else {
        request.use(bodyParser.json());
    }
    if(options.bodyParserUrlencodedLimit) {
        request.use(bodyParser.urlencoded({limit: options.bodyParserUrlencodedLimit, extended: true}));
    } else {
        request.use(bodyParser.urlencoded({extended: true}));
    }
    request.use(cookieParser());
    request.use(cors({origin: true, credentials: true}));

    for(var method in configs) {

        configs[method].forEach(function(config) {

            if(options.proxy === true && config.proxy !== false) {
                // Allows each config file to be bypassed without removing it
                util.log('Proxying', method.toUpperCase(), 'service at', config.path);
            } else {

                var middlewares = [
                    request,
                    requireParameter.bind(null, config.requireParameters),
                    config.callback,
                    delay.middleware.bind(null, config.delay),
                    config.render
                ];

                util.log('Registering', method.toUpperCase(), 'service at', config.path);
                app[method].apply(app, [config.path].concat(middlewares));
                app.options(config.path, cors({origin: true, credentials: true}));
            }

        });
    }

    if(options.proxy) {

        app.all('*', delay.middleware.bind(null, options.proxyDelay), proxy.middleware);

    } else {

        !util.isTest() && app.all('*', function(req, res, next) {
            util.error('404 NOT FOUND:', req.url);
            res.writeHead(404);
            res.end();
        });
    }

    return app;
};

module.exports = {
    bootstrap: bootstrap,
    getConfigurations: getConfigurations,
    createServer: createServer,
    registerServices: registerServices
};
