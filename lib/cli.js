var dyson = require('../lib/dyson'),
    pkg = require('../package.json'),
    ncp = require('ncp').ncp,
    fs = require('fs'),
    path = require('path');

var execute = function(options) {

    if(options.length) {

        var arg1 = options[0];
        var arg2 = options[1];

        if(arg1 === 'init') {

            var source = path.resolve(__dirname + '/../dummy'),
                destination = path.resolve(arg2 || '.');

            ncp(source, destination, function(error) {
                if(error) {
                    return console.error(error, source, destination);
                }
                console.log('Copied dummy files to', destination);
            });

        } else {

            var port = arg2 || 3000,
                configDir = arg1 === 'demo' ? path.resolve(__dirname + '/../demo') : path.resolve(arg1);

            fs.stat(configDir, function(error, stats) {

                if(!error && stats.isDirectory()) {

                    dyson.bootstrap(configDir, port);

                    console.log('Dyson listening at port', port);

                } else {

                    console.error('Directory does not exist:', configDir);

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
        console.log('dyson demo [port]');
        console.log();

    }

};

module.exports = {
    execute: execute
};
