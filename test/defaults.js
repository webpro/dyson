const test = require('bron');
const assert = require('assert').strict;
const assign = require('../lib/defaults');

test('assert should apply defaults (and not overwrite existing values)', () => {
  const config = {
    path: '/test',
    template: {}
  };

  assign(config, 'get');

  assert.equal(config.path, '/test');
  assert.equal(config.cache, true);
  assert.equal(config.collection, false);
  assert.equal(typeof config.size, 'function');
  assert.equal(typeof config.callback, 'function');
  assert.deepEqual(config.template, {});
});

test('assert should bind config methods to the config', () => {
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

  assert.equal(counter, 2);
  assert.deepEqual(c, config);
});
