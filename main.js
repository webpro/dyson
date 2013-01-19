#!/usr/bin/env node

var dyson = require('./lib/dyson'),
    ncp = require('ncp').ncp,
    path = require('path');

if(process.argv.length > 2) {

    var arg1 = process.argv[2];
    var arg2 = process.argv[3];

    if(arg1 === 'init') {

        ncp(path.resolve(__dirname + '/dummy'), path.resolve(arg2), function(err){
            if (err) {
                console.error(err);
            } else {
                console.log('Copied dummy files to', arg2);
            }
        });

    } else {

        var port = arg2 || 3000;
        var configDir = arg1 === 'demo' ? path.resolve(__dirname + '/demo') : path.resolve(arg1);

        dyson.bootstrap(configDir, port);

        console.log('Dyson listening at port', port);

    }

} else {

    console.log('Usage:');
    console.log('dyson init [dir]');
    console.log('dyson [dir] [port]');
    console.log('dyson demo [port]');

}
