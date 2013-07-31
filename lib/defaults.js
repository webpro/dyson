var response = require('./response'),
    _ = require('lodash');

var defaults = {},
    methods = ['get', 'post', 'put', 'delete'];

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

var assign = function(rawConfigs) {

    var configs = {},
        methodConfigs;

    methods.forEach(function(method) {

        methodConfigs = _.isArray(rawConfigs[method]) ? rawConfigs[method] : [rawConfigs[method]];

        configs[method] = _.compact(methodConfigs.map(function(config) {

            if(!config || !config.path) {
                return;
            }

            // Assign method specific defaults
            return _.defaults(config, defaults[method]);

        }));

    });

    return configs;

};

module.exports = {
    assign: assign
};
