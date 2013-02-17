var response = require('./response'),
    _ = require('lodash');

var defaults = {};

defaults.get = {
    cache: true,
    size: function() {
        return _.random(2, 10);
    },
    collection: false,
    callback: response.generate,
    render: response.render
};

defaults.post = defaults.put = defaults.delete = {
    cache: false,
    collection: false,
    callback: response.generate,
    render: response.render
};

var assign = function(configs, method) {
    configs = _.isArray(configs) ? configs : [configs];
    return _.compact(configs.map(function(config) {

        if(!config || !config.path) {
            return;
        }

        // Assign method specific defaults
        config = _.defaults(config, defaults[method]);

        return config;
    }));
};

module.exports = {
    assign: assign
};
