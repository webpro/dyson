const test = require('bron');
const assert = require('assert').strict;
const fs = require('fs');
const path = require('path');
const request = require('supertest');
const getService = require('./_helpers').getService;

const key = fs.readFileSync(path.join(__dirname, 'fixtures', 'key.pem'));
const cert = fs.readFileSync(path.join(__dirname, 'fixtures', 'cert.pem'));

test('https request should respond with correct body', async () => {
  const options = {
    port: 8765,
    https: {
      key: key,
      crt: cert
    }
  };

  const config = {
    path: '/secure',
    template: {
      foo: 'bar'
    }
  };

  const app = getService(config, options);

  const res = await request(app)
    .get('/secure')
    .ca(cert);

  assert.equal(res.status, 200);
  assert.deepEqual(res.body, {
    foo: 'bar'
  });
});
