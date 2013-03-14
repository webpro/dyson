var express = require('express'),
    loader = require('./loader'),
    util = require('./util'),
    path = require('path'),
    cors = require('cors');

var bootstrap = function(configDir, port) {

    var app = initExpress(),
        configs = loader.load(configDir);

    registerServices(app, configs);

    app.listen(port);
};

var initExpress = function() {

    var app = express();

    app.configure(function() {
        app.use(express.bodyParser());
        app.use(cors());
    });

    return app;
};

// Register middleware to Express as service for each config (as in: `app.get(config.path, config.callback);`)

var registerServices = function(app, configs) {

    for(var method in configs) {

        configs[method].forEach(function(config) {

            util.log('Registering', method.toUpperCase(), 'service at', config.path);

            app[method](config.path, config.callback.bind(config), config.render);
        })
    }
};

module.exports = {
    bootstrap: bootstrap,
    util: util,
    // Only export for unit tests
    initExpress: util.isTest() ? initExpress : undefined,
    registerServices: util.isTest() ? registerServices : undefined
};
