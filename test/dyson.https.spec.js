const fs = require('fs'),
  path = require('path'),
  dyson = require('../lib/dyson'),
  request = require('supertest');

const key = fs.readFileSync(path.join(__dirname, 'fixtures', 'key.pem')),
  cert = fs.readFileSync(path.join(__dirname, 'fixtures', 'cert.pem'));

describe('dyson.https', () => {

  describe('request', () => {

    let app;

    before(() => {
      app = dyson.bootstrap({
        configDir: path.join(__dirname, '..', 'dummy'),
        port: 8765,
        https: {
          key: key,
          crt: cert
        }
      });
    });

    after(() => {
      app.get('dyson_server').close();
    });

    it('should respond with correct body', done => {
      request(app).get('/dummy/1').ca(cert).expect(200, {
        id: 1,
        name: 'Lars',
        status: 'OK'
      }, done);
    });
  });
});
