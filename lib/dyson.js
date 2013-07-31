var loader = require('./loader'),
    defaults = require('./defaults'),
    util = require('./util'),
    cors = require('cors'),
    express = require('express'),
    path = require('path');

var app = express();

/*
 * There are roughly 4 steps to initialize dyson:
 *
 * 1. Load raw configurations
 * 2. Mix defaults into raw configurations
 * 3. Register configured services with Express
 * 4. Start Express server
 */

var bootstrap = function(configDir, port) {

    var rawConfigs = loader.load(configDir);

    var configs = defaults.assign(rawConfigs);

    registerServices(configs);

    initExpress(port);


};

var initExpress = function(port) {

    app.use(express.favicon());
    app.use(express.bodyParser());
    app.use(cors());
    app.listen(port);

};

// Register middleware to Express as service for each config (as in: `app.get(config.path, config.callback);`)

var registerServices = function(configs) {

    for(var method in configs) {

        configs[method].forEach(function(config) {

            util.log('Registering', method.toUpperCase(), 'service at', config.path);

            app[method](config.path, config.callback.bind(config), config.render);
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
