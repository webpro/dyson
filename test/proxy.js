import test from 'ava';
import request from 'supertest';
import { getService } from './_helpers';

test('should proxy', async t => {
  const config = {
    path: '/proxy',
    method: 'GET',
    template: {
      isProxy: true
    }
  };

  const options = {
    port: 3001
  };

  const proxyOptions = {
    port: 3000,
    proxy: true,
    proxyHost: 'http://127.0.0.1',
    proxyPort: 3001,
    proxyDelay: 0
  };

  getService(config, options);
  const proxy = getService({}, proxyOptions);

  const res = await request(proxy).get('/proxy');

  t.is(res.status, 200);
  t.deepEqual(res.body, {
    isProxy: true
  });
});
