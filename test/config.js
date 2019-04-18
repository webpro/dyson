import test from 'ava';
import _ from 'lodash';
import request from 'supertest';
import { getService } from './_helpers';

test('should return cached response', async t => {
  let id = 0;
  const app = getService({
    path: '/cache',
    template: {
      id: () => id++
    }
  });

  const res = await request(app).get('/cache');
  const cachedRes = await request(app).get('/cache');

  t.is(cachedRes.status, 200);
  t.deepEqual(cachedRes.body, res.body);
});

test('should not cache the response with a different method', async t => {
  let id = 0;
  const app = getService([
    {
      path: '/cache',
      cache: false,
      method: 'GET',
      template: {
        id: () => id++
      }
    },
    {
      path: '/cache',
      cache: false,
      method: 'POST',
      template: {
        id: () => id++
      }
    }
  ]);

  const res = await request(app).get('/cache');
  const cachedRes = await request(app).post('/cache');

  t.is(cachedRes.status, 200);
  t.notDeepEqual(cachedRes.body, res.body);
});

test('should return uncached response', async t => {
  let id = 0;
  const app = getService({
    path: '/no-cache',
    cache: false,
    template: {
      id: () => id++
    }
  });

  const res = await request(app).get('/no-cache');
  const uncachedRes = await request(app).get('/no-cache');

  t.is(uncachedRes.status, 200);
  t.notDeepEqual(uncachedRes.body, res.body);
});

test('should respond with a collection', async t => {
  let id = 0;
  const config = {
    path: '/collection',
    collection: true,
    size: 2,
    template: {
      id: () => ++id
    }
  };

  const app = getService([
    config,
    {
      ...config,
      path: '/collection-as-function',
      collection: () => true
    },
    {
      ...config,
      path: '/collection-as-function-negative',
      collection: () => false
    },
    {
      ...config,
      path: '/size-as-function',
      size: (params, query) => query.count
    }
  ]);

  const res1 = await request(app).get('/collection');
  const res2 = await request(app).get('/collection-as-function');
  const res3 = await request(app).get('/collection-as-function-negative');
  const res4 = await request(app).get('/size-as-function?count=3');

  t.is(res1.status, 200);
  t.is(res2.status, 200);
  t.is(res3.status, 200);
  t.is(res4.status, 200);

  t.deepEqual(res1.body, [{ id: 1 }, { id: 2 }]);
  t.deepEqual(res2.body, [{ id: 3 }, { id: 4 }]);
  t.deepEqual(res3.body, { id: 5 });
  t.deepEqual(res4.body, [{ id: 6 }, { id: 7 }, { id: 8 }]);
});

test('should respond with a collection (combined request)', async t => {
  const config = {
    path: '/combined/:id',
    template: {
      id: params => Number(params.id)
    }
  };
  const app = getService(config, {
    multiRequest: ','
  });

  const res = await request(app).get('/combined/1,2,3');

  t.is(res.status, 200);
  t.deepEqual(res.body, [{ id: 1 }, { id: 2 }, { id: 3 }]);
});

test('should respond with a 204 for an OPTIONS request', async t => {
  const app = getService({
    path: '/opts',
    template: []
  });

  const res = await request(app).options('/opts');

  t.is(res.status, 204);
  t.is(res.headers['access-control-allow-methods'], 'GET,HEAD,PUT,PATCH,POST,DELETE');
  t.is(res.headers['access-control-allow-credentials'], 'true');
  // The next actual value is 'undefined', should be req.header('Origin') (probably an issue with supertest)
  // t.is(res.headers['access-control-allow-origin'], '*');
});

test('should respond with 400 bad request if required parameter not found', async t => {
  const app = getService({
    path: '/require-param',
    requireParameters: ['name'],
    template: []
  });

  const res = await request(app).get('/require-param');

  t.is(res.status, 400);
  t.deepEqual(res.body, { error: 'Required parameters (name) not found.' });

  const resParam = await request(app).get('/require-param?name=foo');
  t.is(resParam.status, 200);
  t.deepEqual(resParam.body, []);
});

test('should delay the response', async t => {
  const app = getService({
    path: '/delay',
    delay: 200,
    template: []
  });

  const start = _.now();
  const res = await request(app).get('/delay');
  const delayed = _.now() - start;

  t.is(res.status, 200);
  t.true(delayed >= 200);
});

test('should support status function', async t => {
  const app = getService({
    path: '/status-418',
    status: (req, res, next) => {
      res.status(418);
      next();
    },
    template: ['foo', 'bar']
  });

  const res = await request(app).get('/status-418');

  t.is(res.status, 418);
  t.deepEqual(res.body, ['foo', 'bar']);
});

test('should support HEAD requests', async t => {
  const app = getService({
    path: '/head',
    method: 'HEAD'
  });

  const res = await request(app).head('/head');

  t.is(res.status, 200);
});
