const test = require('bron');
const assert = require('assert').strict;
const sinon = require('sinon');
const request = require('supertest');
const { assembleResponse } = require('../lib/response');
const { getService } = require('./_helpers');

test('should return a promise', async () => {
  const awaitResponse = assembleResponse({});
  assert.equal(typeof awaitResponse.then, 'function');
  assert.deepEqual(await awaitResponse, {});
});

test('should render data based on template', async () => {
  assert.deepEqual(
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

test('should return an array', async () => {
  assert.deepEqual(
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

test('should parse template objects recursively', async () => {
  assert.deepEqual(
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

test('should replace a promise with its resolved value', async () => {
  assert.deepEqual(
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

test('should expose request to template', async () => {
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

  assert(spy.callCount === 2);
  assert.equal(spy.firstCall.args[0], spy.secondCall.args[0]);

  const req = spy.firstCall.args[0];

  assert('params' in req);
  assert('query' in req);
  assert('body' in req);
  assert('cookies' in req);
  assert('headers' in req);
});
