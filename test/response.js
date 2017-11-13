import test from 'ava';
import sinon from 'sinon';
import request from 'supertest';
import { assembleResponse } from '../lib/response';
import { getService } from './_helpers';

test('should return a promise', async t => {
  const awaitResponse = assembleResponse({});
  t.is(typeof awaitResponse.then, 'function');
  t.deepEqual(await awaitResponse, {});
});

test('should render data based on template', async t => {
  t.deepEqual(
    await assembleResponse({
      myFunction: () => {
        return 'my function';
      },
      myString: 'my string',
      myBoolean: true,
      myNumber: 42,
      myArray: [1, 2, 3]
    }),
    {
      myFunction: 'my function',
      myString: 'my string',
      myBoolean: true,
      myNumber: 42,
      myArray: [1, 2, 3]
    }
  );
});

test('should return an array', async t => {
  t.deepEqual(
    await assembleResponse([
      () => {
        return 'my function';
      },
      2,
      {}
    ]),
    ['my function', 2, {}]
  );
});

test('should parse template objects recursively', async t => {
  t.deepEqual(
    await assembleResponse({
      myObject: {
        myNestedObject: {
          myDeepFunction: () => {
            return 'my other function';
          },
          myDeepString: 'my other string'
        }
      }
    }),
    {
      myObject: {
        myNestedObject: {
          myDeepFunction: 'my other function',
          myDeepString: 'my other string'
        }
      }
    }
  );
});

test('should replace a promise with its resolved value', async t => {
  t.deepEqual(
    await assembleResponse({
      myPromiseFn: () => Promise.resolve('my promise'),
      myPromise: Promise.resolve('my promise')
    }),
    {
      myPromiseFn: 'my promise',
      myPromise: 'my promise'
    }
  );
});

test('should expose request to template', async t => {
  const spy = sinon.spy();
  const app = getService({
    path: '/foo',
    exposeRequest: true,
    template: spy,
    container: {
      foo: spy
    }
  });

  await request(app).get('/foo');

  t.true(spy.callCount === 2);
  t.is(spy.firstCall.args[0], spy.secondCall.args[0]);

  const req = spy.firstCall.args[0];

  t.true('params' in req);
  t.true('query' in req);
  t.true('body' in req);
  t.true('cookies' in req);
  t.true('headers' in req);
});
