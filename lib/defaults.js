const response = require('./response'),
    _ = require('lodash');

const defaults = {},
    methods = ['get', 'post', 'put', 'delete', 'patch', 'options'];
methods.forEach(method => {
    defaults[method] = {
        cache: false,
        delay: false,
        proxy: false,
        size: () => _.random(2, 10),
        collection: false,
        callback: response.generate,
        render: response.render
    };
});

defaults.get.cache = true;

const assignToAll = rawConfigs => {
    const configs = {};
    methods.forEach(method => {
        configs[method] = assign(rawConfigs[method], method);
    });

    return configs;
};

const assign = (configs, method) => {
    configs = _.isArray(configs) ? configs : [configs];
    return _.compact(configs.map(config => {
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
    assignToAll,
    assign
};