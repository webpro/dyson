var defaults = require('./defaults'),
    fs = require('fs'),
    path = require('path'),
    _ = require('lodash');

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
    if(!(fs.existsSync(dir) && fs.statSync(dir).isDirectory())) return;
    return fs.readdirSync(dir).map(function(element) {
        var file = path.join(dir, element), stats = fs.statSync(file);
        return stats && stats.isFile() ? require(path.join(dir, path.basename(file, '.js'))) : false;
    });
};

module.exports = {
    load: load
};
