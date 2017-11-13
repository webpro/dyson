import test from 'ava';
import sinon from 'sinon';
import dyson from '../lib/dyson';
import { getService } from './_helpers';

test('should add GET route to Express', t => {
  const app = getService();
  const spy = sinon.spy(app, 'get');
  const config = {
    path: '/',
    status: () => {},
    callback: () => {},
    render: () => {}
  };

  dyson.registerServices(app, {}, config);

  t.is(spy.lastCall.args[0], '/');
  t.true(spy.lastCall.args.includes(config.status));
  t.true(spy.lastCall.args.includes(config.callback));
  t.true(spy.lastCall.args.includes(config.render));
});

test('should add GET route to Express', t => {
  const app = getService();
  const spy = sinon.spy(app, 'post');
  const config = {
    path: '/',
    method: 'POST'
  };

  dyson.registerServices(app, {}, config);

  t.is(spy.firstCall.args[0], '/');
});

test('should add OPTIONS route to Express', t => {
  const app = getService();
  const spy = sinon.spy(app, 'options');
  const config = {
    path: '/',
    method: 'GET'
  };

  dyson.registerServices(app, {}, config);

  t.is(spy.firstCall.args[0], '/');
  t.is(typeof spy.firstCall.args[1], 'function');
});
