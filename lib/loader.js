var _ = require('lodash'),
    fs = require('fs'),
    path = require('path');

var load = function(configDir) {

    var methods = ['get', 'post', 'put', 'delete'],
        configs = {},
        methodConfigs,
        methodDir;

    methods.forEach(function(method) {

        methodDir = path.resolve(configDir + '/' + method);

        methodConfigs = requireDir(methodDir);

        configs[method] = _.flatten(methodConfigs, true);

    });

    return configs;
};

var requireDir = function(dir) {

    if(!(fs.existsSync(dir) && fs.statSync(dir).isDirectory())) {
        return;
    }

    return fs.readdirSync(dir).map(function(element) {

        if(element[0] === '.' || !/\.js$/i.test(element)) {
            return;
        }

        var file = path.join(dir, element),
            stats = fs.statSync(file);

        return stats.isFile() ? require(file) : false;

    });
};

module.exports = {
    load: load
};
