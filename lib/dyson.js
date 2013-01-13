var express = require('express'),
    generators = require('./generators'),
    multiRequest = require('./multiRequest');

var load = function(configDir, port) {

    var app = express();

    app.configure(function() {
        app.use(express.bodyParser());
        app.use(allowCrossDomain);
    });

    multiRequest.configure({port: port});

    // Read configuration files from the `configDir` subfolders

    var methodDir,
        services = {};

    ['get', 'post', 'put', 'delete'].forEach(function(method) {
        methodDir = configDir + '/' + method;
        services[method] = require('./' + method).loadConfigurations(methodDir);
    });

    // Register middleware to Express for each service (as in: `app.get(service.path, service.callback);`)

    for(var method in services) {

        services[method].forEach(function(service) {

            console.log('Registering', method.toUpperCase(), 'service at', service.path);

            var generateResponse = function() {
                service.callback.apply(service, arguments);
            };

            app[method](service.path, generateResponse, renderResponse);
        })
    }

    // Register basic `OPTIONS` method separately

    app.options('/*', function(req, res) {
        console.log('Sending 200 (OPTIONS)');
        res.send(200);
    });

    app.listen(port);

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
    load: load,
    generators: generators,
    multiRequest: multiRequest
};
