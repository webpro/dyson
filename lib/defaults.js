var response = require('./response'),
    _ = require('lodash');

var defaults = {},
    methods = ['get', 'post', 'put', 'delete', 'patch'];

defaults.get = defaults.post = defaults.put = defaults.delete = defaults.patch = {
    cache: false,
    delay: false,
    proxy: false,
    size: function() {
        return _.random(2, 10);
    },
    collection: false,
    callback: response.generate,
    render: response.render
};

defaults.get.cache = true;

var assignToAll = function(rawConfigs) {

    var configs = {};

    methods.forEach(function(method) {

        configs[method] = assign(rawConfigs[method], method);

    });

    return configs;

};

var assign = function(configs, method) {

    configs = _.isArray(configs) ? configs : [configs];

    return _.compact(configs.map(function(config) {

        if(!config || !config.path) {
            return;
        }

        // Assign method specific defaults
        config = _.defaults(config, defaults[method]);

        // Bind each method to the config itself
        return _.bindAll(config);

    }));

};

module.exports = {
    assignToAll: assignToAll,
    assign: assign
};
