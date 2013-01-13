var _ = require('lodash'),
    requireDir = require('../requireDir');

var loadConfigurations = function(dir) {
    return _.flatten(requireDir(dir), true);
};

module.exports = {
    loadConfigurations: loadConfigurations
};
