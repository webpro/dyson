var defaults = require('./defaults'),
    _ = require('lodash'),
    fs = require('fs'),
    path = require('path');

var load = function(configDir) {

    var configs = {},
        methodConfigs,
        methodDir;

    ['get', 'post', 'put', 'delete'].forEach(function(method) {
        methodDir = configDir + '/' + method;
        methodConfigs = _.flatten(requireDir(methodDir), true);
        configs[method] = defaults.assign(methodConfigs, method);
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
            stats = fs.statSync(file),
            isFile = stats.isFile();

        return isFile ? require(file) : false;

    });
};

module.exports = {
    load: load
};
