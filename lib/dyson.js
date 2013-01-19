var express = require('express'),
    generators = require('./generators'),
    multiRequest = require('./multiRequest'),
    util = require('./util'),
    path = require('path');

var bootstrap = function(configDir, port) {

    multiRequest.configure({port: port});

    var app = initExpress();

    var configs = getConfigurations(configDir);

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

var getConfigurations = function(configDir) {

    var libDir = path.resolve(__dirname),
        configs = {},
        methodDir;

    ['get', 'post', 'put', 'delete'].forEach(function(method) {
        methodDir = configDir + '/' + method;
        configs[method] = require(libDir + '/' + method).loadConfigurations(methodDir);
    });

    return configs;
};

// Register middleware to Express as service for each config (as in: `app.get(config.path, config.callback);`)

var registerServices = function(app, configs) {

    for(var method in configs) {

        configs[method].forEach(function(config) {

            util.log('Registering', method.toUpperCase(), 'service at', config.path);

            var generateResponse = function() {
                config.callback.apply(config, arguments);
            };

            app[method](config.path, generateResponse, renderResponse);
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

var renderResponse = function(req, res) {
    res.send(200, res.body);
};

module.exports = {
    bootstrap: bootstrap,
    generators: generators,
    multiRequest: multiRequest,
    util: util,
    // Only export for unit tests
    initExpress: util.isTest() ? initExpress : undefined,
    getConfigurations: util.isTest() ? getConfigurations : undefined,
    registerServices: util.isTest() ? registerServices : undefined
};
