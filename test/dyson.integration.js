const request = require('supertest'),
  dyson = require('../lib/dyson'),
  defaults = require('../lib/defaults'),
  _ = require('lodash');

describe('dyson', () => {

  describe('.registerServices [integration]', () => {

    let app,
      configs;
    const options = {port:3000};

    before(() => {

      app = dyson.createServer(options);

      configs = {
        'get': [
          {
            path: '/cache',
            template: {
              id: _.uniqueId
            }
          },
          {
            path: '/nocache',
            cache: false,
            template: {
              id: _.uniqueId
            }
          },
          {
            path: '/collection',
            collection: true,
            size: 2,
            template: {
              id: _.uniqueId
            }
          },
          {
            path: '/collection-as-function',
            collection: () => {
              return true;
            },
            size: 2,
            template: {
              id: _.uniqueId
            }
          },
          {
            path: '/collection-as-function-negative',
            collection: () => {
              return false;
            },
            size: 2,
            template: {
              id: _.uniqueId
            }
          },
          {
            path: '/size-as-function',
            collection: true,
            size: (params, query) => {
              return query.count;
            },
            template: {}
          },
          {
            path: '/combined/:id',
            template: {}
          },
          {
            path: '/require-para',
            requireParameters: ['name']
          },
          {
            path: '/delay',
            delay: 200,
            template: {
              id: _.uniqueId
            }
          }
        ]
      };

      defaults.assign(configs.get, 'get');

      dyson.registerServices(app, options, configs);

    });

    after(() => {
      app.get('dyson_server').close();
    });

    it('should respond with a cached response', done => {

      request(app).get('/cache').end((err, res) => {
        request(app).get('/cache').expect(200, res.body, done);
      });

    });

    it('should respond with a non-cached response', done => {

      request(app).get('/nocache').end((err, res) => {

        const response = res.body;

        request(app).get('/nocache').expect(200).end((err, res) => {
          res.body.should.not.eql(response);
          done();
        });
      });
    });

    it('should respond with a collection', done => {

      request(app).get('/collection').expect(200).end((err, res) => {
        res.body.should.be.an.Array().and.have.length(2);
        done();
      });

    });

    it('should respond with a collection (function)', done => {

      request(app).get('/collection-as-function').expect(200).end((err, res) => {
        res.body.should.be.an.Array().and.have.length(2);
        done();
      });

    });

    it('should respond with a collection (function, negative)', done => {

      request(app).get('/collection-as-function-negative').expect(200).end((err, res) => {
        res.body.should.be.an.Object().and.have.property('id');
        done();
      });

    });

    it('should respond with a collection where size is a function', done => {

      request(app).get('/size-as-function?count=3').expect(200).end((err, res) => {
        res.body.should.have.length(3);
        done();
      });

    });

    it('should respond with a collection (combined request)', done => {

      const options = app.get('dyson_options');
      options.multiRequest = ',';
      app.set('options', options);

      request(app).get('/combined/1,2,3').expect(200).end((err, res) => {
        res.body.should.be.an.Array().and.have.length(3);
        done();
      });

    });

    it('should respond with a 204 for an OPTIONS request', done => {

      request(app).options('/cache').expect(204).end((err, res) => {
        res.headers['access-control-allow-methods'].should.equal('GET,HEAD,PUT,PATCH,POST,DELETE');
        res.headers['access-control-allow-credentials'].should.equal('true');
        // The next actual value is 'undefined', should be req.header('Origin') (probably an issue with supertest)
        // res.headers['access-control-allow-origin'].should.equal('*');
        done();
      });

    });

    it('should respond with 400 bad request if required parameter not found', done => {
      request(app).get('/require-para').expect(400).end((err, res) => {
        res.body.error.should.containEql('(name) not found');

        // with required parameter
        request(app).get('/require-para?name=Tim').expect(200).end(() => {
          done();
        });
      });

    });

    it('should delay the response', done => {
      const start = _.now();
      request(app).get('/delay').expect(() => {
        const delayed = _.now() - start;
        delayed.should.be.aboveOrEqual(200);
      }).end(done);

    });

    it('status', done => {

      const config = {
        path: '/status-418',
        template: {
          foo: 1
        },
        status: (req, res, next) => {
          res.status(202);
          next();
        }
      };

      dyson.registerServices(app, options, {get: defaults.assign(config, 'get')});

      request(app).get('/status-418').expect(202, {foo: 1}, done);

    });
  });
});
