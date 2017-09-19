const _ = require('lodash');
const requireDir = require('require-directory');
const path = require('path');

const methods = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'];

const load = configDir => {
  const rawConfigs = requireDir(module, path.resolve(configDir));
  const configs = {};
  methods.forEach(method => {
    configs[method] = _.flattenDeep(findRecursive(rawConfigs, method));
  });

  return configs;
};

const findRecursive = (obj, method) => {
  const configs = [];
  for (const key in obj) {
    if (_.isObject(obj[key])) {
      if ('path' in obj[key]) {
        if (obj.__method === method || (obj[key].method && obj[key].method.toLowerCase() === method)) {
          configs.push(obj[key]);
        }
      } else {
        obj[key].__method = key === method ? method : obj.__method;
        configs.push(findRecursive(obj[key], method));
      }
    }
  }
  return configs;
};

module.exports = {
  load
};
