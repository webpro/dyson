var _ = require('lodash'),
    requireDir = require('../requireDir'),
    defaults = require('./defaults');

var loadConfigurations = function(dir) {

    var modules = requireDir(dir);

    return _.flatten(modules, true).map(function(serviceConfig) {
        return _.defaults(serviceConfig, defaults);
    });
};

module.exports = {
    loadConfigurations: loadConfigurations
};
