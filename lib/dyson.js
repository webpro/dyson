var express = require('express'),
    loader = require('./loader'),
    generators = require('./generators'),
    util = require('./util'),
    path = require('path');

var bootstrap = function(configDir, port) {

    var app = initExpress();

    var configs = loader.load(configDir);

    registerServices(app, configs);

    app.listen(port);
};

var initExpress = function() {

    var app = express();

    app.configure(function() {
        app.use(express.bodyParser());
        app.use(allowCrossDomain);
    });

    // Register basic `OPTIONS` method separately

    app.options('/*', function(req, res) {
        util.log('Sending 200 (OPTIONS)');
        res.send(200);
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

    return app;
};

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-HTTP-Method-Override');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    next();
};

module.exports = {
    bootstrap: bootstrap,
    generators: generators,
    util: util,
    // Only export for unit tests
    initExpress: util.isTest() ? initExpress : undefined,
    registerServices: util.isTest() ? registerServices : undefined
};
