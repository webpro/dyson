const dyson = require('./dyson'),
    pkg = require('../package.json'),
    _ = require('lodash'),
    ncp = require('ncp').ncp,
    fs = require('fs'),
    path = require('path');

const execute = options => {

    if(options.length) {
        const [arg1, arg2] = options;
        if(arg1 === 'init') {
            console.warn('WARNING: "dyson init" is deprecated and will be removed in the next major release.');
            const source = path.resolve(`${__dirname}/../dummy`),
                destination = path.resolve(arg2 || '.');

            ncp(source, destination, (error) => {
                if(error) {
                    return console.error(error, source, destination);
                }
                console.info(`Copied dummy files to ${destination}`);
            });
        } else {
            const opts = _.defaults(readOptions(arg1), {
                port: arg2 || 3000,
                configDir: arg1,
                proxy: false,
                multiRequest: ','
            });
            opts.configDir = path.resolve(opts.configDir);
            fs.stat(opts.configDir, (error, stats) => {
                if(!error && stats.isDirectory()) {
                    dyson.bootstrap(opts);
                    console.info(`Dyson listening at port: ${opts.port}`);
                } else {
                    console.error(`Directory does not exist: ${opts.configDir}`);
                }
            });
        }
    } else {
        const version = pkg.version;
        console.info(`dyson version: ${version}
        
        Usage:
        
        dyson init <dir>
        dyson <dir> [port]
        
        `);
    }
};

const readOptions = configDir => {
    const source = path.resolve(configDir, 'dyson.json');
    let config = {};

    if(fs.existsSync(source)) {
        const stats = fs.statSync(source);
        if(stats && stats.isFile()) {
            config = require(source);
        }
    }

    return config;
};

module.exports = {
    execute
};
