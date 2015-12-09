var _ = require('lodash'),
    requireDir = require('require-directory'),
    path = require('path');

var methods = ['get', 'post', 'put', 'delete', 'patch'];

var load = function(configDir) {

    var rawConfigs = requireDir(module, path.resolve(configDir)),
        configs = {};

    methods.forEach(function(method) {
        configs[method] = _.flattenDeep(findRecursive(rawConfigs, method));
    });

    return configs;
};

function findRecursive(obj, method) {
    var configs = [];
    for(var key in obj) {
        if(_.isObject(obj[key])) {
            if('path' in obj[key]) {
                if(obj.__method === method || (obj[key].method && obj[key].method.toLowerCase() === method)) {
                    configs.push(obj[key]);
                }
            } else {
                obj[key].__method = key === method ? method : obj.__method;
                configs.push(findRecursive(obj[key], method));
            }
        }
    }
    return configs;
}

module.exports = {
    load: load
};
