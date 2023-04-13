const _ = require('lodash');
const requireDir = require('require-directory');
const path = require('path');

const methods = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'];

const load = configDir => {
  const rawConfigs = requireDir(module, path.resolve(configDir), { extensions: ['js', 'ts'] });
  return _.flattenDeep(findRecursive(rawConfigs));
};

const findRecursive = obj => {
  const configs = [];
  for (const key in obj) {
    const config = obj[key];
    if (_.isObject(config)) {
      const _config = { ...config };
      const _key = key.toLowerCase();
      const method = (_config.method || '').toLowerCase();
      _config.method = method || (~methods.indexOf(_key) ? _key : obj.method || undefined);
      if ('path' in _config) {
        configs.push(_config);
      } else {
        configs.push(findRecursive(_config));
      }
    }
  }
  return configs;
};

module.exports = load;
