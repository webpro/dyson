const test = require('bron');
const assert = require('assert').strict;
const load = require('../lib/loader');
const _ = require('lodash');

const configDir = __dirname + '/dummy';

test('load should return configuration for each method found', () => {
  const configs = load(configDir);

  assert.equal(configs.length, 5);
  assert.equal(_.filter(configs, { method: 'get' }).length, 4);
  assert.equal(_.filter(configs, { method: 'patch' }).length, 1);
});
