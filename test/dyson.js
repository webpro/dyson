const test = require('bron');
const assert = require('assert').strict;
const sinon = require('sinon');
const dyson = require('../lib/dyson');
const getService = require('./_helpers').getService;

test('should add GET route to Express', () => {
  const app = getService();
  const spy = sinon.spy(app, 'get');
  const config = {
    path: '/',
    status: () => {},
    callback: () => {},
    render: () => {}
  };

  dyson.registerServices(app, {}, config);

  assert.equal(spy.lastCall.args[0], '/');
  assert(spy.lastCall.args.includes(config.status));
  assert(spy.lastCall.args.includes(config.callback));
  assert(spy.lastCall.args.includes(config.render));
});

test('should add POST route to Express', () => {
  const app = getService();
  const spy = sinon.spy(app, 'post');
  const config = {
    path: '/',
    method: 'POST'
  };

  dyson.registerServices(app, {}, config);

  assert.equal(spy.firstCall.args[0], '/');
});

test('should add OPTIONS route to Express', () => {
  const app = getService();
  const spy = sinon.spy(app, 'options');
  const config = {
    path: '/',
    method: 'GET'
  };

  dyson.registerServices(app, {}, config);

  assert.equal(spy.firstCall.args[0], '/');
  assert.equal(typeof spy.firstCall.args[1], 'function');
});
