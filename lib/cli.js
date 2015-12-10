var dyson = require('./dyson'),
    pkg = require('../package.json'),
    _ = require('lodash'),
    ncp = require('ncp').ncp,
    fs = require('fs'),
    path = require('path');

var execute = function(options) {

    if(options.length) {

        var arg1 = options[0];
        var arg2 = options[1];

        if(arg1 === 'init') {

            console.log('WARNING: "dyson init" is deprecated and will be removed in the next major release.');

            var source = path.resolve(__dirname + '/../dummy'),
                destination = path.resolve(arg2 || '.');

            ncp(source, destination, function(error) {
                if(error) {
                    return console.error(error, source, destination);
                }
                console.log('Copied dummy files to', destination);
            });

        } else {

            var opts = _.defaults(readOptions(arg1), {
                port: arg2 || 3000,
                configDir: arg1,
                proxy: false,
                multiRequest: ','
            });

            opts.configDir = path.resolve(opts.configDir);

            fs.stat(opts.configDir, function(error, stats) {

                if(!error && stats.isDirectory()) {

                    dyson.bootstrap(opts);

                    console.log('Dyson listening at port', opts.port);

                } else {

                    console.error('Directory does not exist:', opts.configDir);

                }
            });

        }

    } else {

        var version = pkg.version;

        console.log();
        console.log('dyson v' + version);
        console.log();
        console.log('Usage:');
        console.log();
        console.log('dyson init <dir>');
        console.log('dyson <dir> [port]');
        console.log();

    }

};

var readOptions = function(configDir) {

    var source = path.resolve(configDir, 'dyson.json'),
        config = {};

    if(fs.existsSync(source)) {
        var stats = fs.statSync(source);
        if(stats && stats.isFile()) {
            config = require(source);
        }
    }

    return config;
};

module.exports = {
    execute: execute
};
