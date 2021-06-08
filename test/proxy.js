const test = require('bron');
const assert = require('assert').strict;
const request = require('supertest');
const getService = require('./_helpers').getService;

test('should proxy', async () => {
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

  assert.equal(res.status, 200);
  assert.deepEqual(res.body, {
    isProxy: true
  });
});
