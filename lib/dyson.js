var loader = require('./loader'),
    defaults = require('./defaults'),
    util = require('./util'),
    cors = require('cors'),
    express = require('express'),
    path = require('path');

/*
 * There are roughly 4 steps to initialize dyson:
 *
 * 1. Load raw configurations
 * 2. Mix defaults into raw configurations
 * 3. Initialize Express server
 * 4. Register configured services with Express
 */

var bootstrap = function(configDir, port) {

	var rawConfigs = loader.load(configDir);

    var configs = defaults.assignToAll(rawConfigs);

	var app = initExpress(port);

    registerServices(app, configs);

};

var initExpress = function(port) {

	var app = express();

	app.use(express.favicon());
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(cors({origin: true, credentials: true}));
    app.listen(port);

	return app;
};

// Register middleware to Express as service for each config (as in: `app.get(config.path, config.callback);`)

var registerServices = function(app, configs) {

    for(var method in configs) {

        configs[method].forEach(function(config) {

            util.log('Registering', method.toUpperCase(), 'service at', config.path);

            app[method](config.path, config.callback.bind(config), config.render.bind(config));
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
