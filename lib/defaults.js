var response = require('./response'),
    _ = require('lodash');

var defaults = {};

defaults.get = {
    cache: true,
    size: function() {
        return _.random(2,10);
    },
    collection: false,
    callback: response.generate
};

defaults.post = defaults.put = defaults.delete = {
    cache: false,
    collection: false,
    callback: response.generate
};

var assign = function(configs, method) {
    configs = _.isArray(configs) ? configs : [configs];
    return configs.map(function(config) {

        // Assign method specific defaults
        config = _.defaults(config, defaults[method]);

        config.render = response.render;

        return config;
    });
};

module.exports = {
    assign: assign
};
