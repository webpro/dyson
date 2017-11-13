import test from 'ava';
import fs from 'fs';
import path from 'path';
import request from 'supertest';
import { getService } from './_helpers';

const key = fs.readFileSync(path.join(__dirname, 'fixtures', 'key.pem'));
const cert = fs.readFileSync(path.join(__dirname, 'fixtures', 'cert.pem'));

test('https request should respond with correct body', async t => {
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

  t.is(res.status, 200);
  t.deepEqual(res.body, {
    foo: 'bar'
  });
});
