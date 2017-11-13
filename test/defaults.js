import test from 'ava';
import { assign } from '../lib/defaults';

test('assert should apply defaults (and not overwrite existing values)', t => {
  const config = {
    path: '/test',
    template: {}
  };

  assign(config, 'get');

  t.is(config.path, '/test');
  t.is(config.cache, true);
  t.is(config.collection, false);
  t.is(typeof config.size, 'function');
  t.is(typeof config.callback, 'function');
  t.deepEqual(config.template, {});
});

test('assert should bind config methods to the config', t => {
  let counter = 0;

  const config = {
    path: '/test',
    template: {},
    callback: function() {
      counter++;
      return this;
    },
    render: function() {
      counter++;
      return this;
    }
  };

  assign(config, 'get');

  const c = config.callback().render();

  t.is(counter, 2);
  t.is(c, config);
});
