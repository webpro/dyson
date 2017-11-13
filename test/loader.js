import test from 'ava';
import load from '../lib/loader';
import _ from 'lodash';

const configDir = __dirname + '/dummy';

test('load should return configuration for each method found', t => {
  const configs = load(configDir);

  t.is(configs.length, 5);
  t.is(_.filter(configs, { method: 'get' }).length, 4);
  t.is(_.filter(configs, { method: 'patch' }).length, 1);
});
