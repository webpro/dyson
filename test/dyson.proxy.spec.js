var fs = require('fs'),
    path = require('path'),
    dyson = require('../lib/dyson'),
    defaults = require('../lib/defaults'),
    request = require('supertest'),
    express = require('express'),
    sinon = require('sinon');

describe('dyson.proxy', function() {

    describe('request', function() {

      var proxy,
        app;

        before(() => {
          proxy = dyson.bootstrap({
            port: 3000,
            configDir: path.join(__dirname, 'empty'),
            proxy: true,
            proxyHost: 'http://127.0.0.1',
            proxyPort: 3001,
            proxyDelay: 0
          });
          app = dyson.bootstrap({
            port: 3001,
            configDir: path.join(__dirname, 'dummy', 'proxy')
          });
        });

        after(() => {
          proxy.get('server').close();
          app.get('server').close();
        });

        it('should respond with correct body', function(done) {
            request(proxy).get('/proxy').expect(200, {isProxy: true}, done);
        });
    });
});
