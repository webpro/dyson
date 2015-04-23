var path = require('path'),
    express = require('express'),
    favicon = require('static-favicon'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    cors = require('cors'),
    loader = require('./loader'),
    defaults = require('./defaults'),
    proxy = require('./proxy'),
    util = require('./util'),
    requireParameter = require('./parameter');

/*
 * There are roughly 4 steps to initialize dyson:
 *
 * 1. Load raw configurations
 * 2. Mix defaults into raw configurations
 * 3. Initialize Express server
 * 4. Register configured services with Express
 */

var bootstrap = function(options) {

    util.options.set(options);

    var rawConfigs = loader.load(options.configDir);

    var configs = defaults.assignToAll(rawConfigs);

    var app = initExpress(options.port);

    registerServices(app, options, configs);

};

var initExpress = function(port) {

    var app = express();

    app.use(favicon());
    app.use(bodyParser.json());
    app.use(cookieParser());
    app.use(cors({origin: true, credentials: true}));
    app.listen(port);

    return app;
};

// Register middleware to Express as service for each config (as in: `app.get(config.path, config.callback);`)

var registerServices = function(app, options, configs) {

    for(var method in configs) {

        configs[method].forEach(function(config) {

            if(options.proxy === true && config.proxy !== false) {
                // Allows each config file to be bypassed without removing it
                util.log('Proxying', method.toUpperCase(), 'service at', config.path);
            } else {
                util.log('Registering', method.toUpperCase(), 'service at', config.path);
                app[method](config.path, requireParameter.bind(config), config.callback, config.render);
            }

        });
    }

    if(options.proxy) {

        app.all('*', proxy.middleware);

    } else {

        !util.isTest() && app.all('*', function(req, res, next) {
            util.error('404 NOT FOUND:', req.url);
            res.writeHead(404);
            res.end();
        });
    }
};

module.exports = {
    bootstrap: bootstrap,
    util: util,
    // Only export for unit tests
    initExpress: util.isTest() ? initExpress : undefined,
    registerServices: util.isTest() ? registerServices : undefined
};
