var loader = require('./loader'),
    defaults = require('./defaults'),
    util = require('./util'),
    cors = require('cors'),
    express = require('express'),
	request = require('request'),
    path = require('path');

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

    app.use(express.favicon());
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(cors({origin: true, credentials: true}));
    app.listen(port);

    return app;
};

// Register middleware to Express as service for each config (as in: `app.get(config.path, config.callback);`)

var registerServices = function(app, options, configs) {

    for(var method in configs) {

        configs[method].forEach(function(config) {

            util.log('Registering', method.toUpperCase(), 'service at', config.path);

            app[method](config.path, config.callback.bind(config), config.render);
        });
    }

    if(options.proxy) {
		app.all('*', function(req, res) {
			var proxyURI = options.proxyHost + (options.proxyPort ? ':' + options.proxyPort : '') + req.url;
			util.log('Proxying', req.url, 'to', proxyURI);
			req.pipe(request[req.method.toLowerCase()](proxyURI)).pipe(res);
		});
    } else {
        app.all('*', function(req, res, next) {
            util.log('No endpoint is configured for', req.url);
            next();
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
