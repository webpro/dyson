const _ = require('lodash');
const response = require('./response');

const getDefaults = method => ({
  cache: method === 'get' ? true : false,
  delay: false,
  proxy: false,
  size: () => _.random(2, 10),
  collection: false,
  status: (req, res, next) => next(),
  callback: response.generate,
  render: response.render
});

const assign = configs =>
  _.compact(
    _.castArray(configs).map(config => {
      if (!config || !config.path) {
        return;
      }

      const method = (config.method || 'get').toLowerCase();
      config.method = method;
      config = _.defaults(config, getDefaults(method));

      return _.bindAll(config);
    })
  );

module.exports = assign;
