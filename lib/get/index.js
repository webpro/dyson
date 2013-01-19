var _ = require('lodash'),
    requireDir = require('../requireDir'),
    defaults = require('./defaults');

var loadConfigurations = function(dir) {

    var modules = requireDir(dir),
        configs = _.flatten(modules, true);

    return defaults.assign(configs);
};

module.exports = {
    loadConfigurations: loadConfigurations
};
