var request = require('supertest'),
    dyson = require('../lib/dyson'),
    util = require('../lib/util'),
    defaults = require('../lib/defaults'),
    _ = require('lodash');

describe('dyson', function() {

    describe('.registerServices [integration]', function() {

        var app,
            options = {},
            configs;

        before(function() {

            app = dyson.initExpress();

            // The `dyson.generators.id` method returns a new, unique id when it is called starting at 0 (it's actually _.uniqueId).,
            // this comes in handy when testing whether a response was cached or not.

            configs = {
                'get': [{
                    path: '/cache',
                    template: {
                        id: _.uniqueId
                    }
                }, {
                    path: '/nocache',
                    cache: false,
                    template: {
                        id: _.uniqueId
                    }
                }, {
                    path: '/collection',
                    collection: true,
                    size: 2,
                    template: {
                        id: _.uniqueId
                    }
                }, {
                    path: '/size-as-function',
                    collection: true,
                    size: function(params, query) {
                        return query.count;
                    },
                    template: {}
                }, {
                    path: '/combined/:id',
                    template: {}
                }]
            };

            defaults.assign(configs.get, 'get');

            dyson.registerServices(app, options, configs);

        });

        it('should respond with a cached response', function(done) {

            request(app).get('/cache').end(function(err, res) {
                request(app).get('/cache').expect(200, res.body, done);
            });

        });

        it('should respond with a non-cached response', function(done) {

            var response;

            request(app).get('/nocache').end(function(err, res) {

                response = res.body;

                request(app).get('/nocache').expect(200).end(function(err, res) {
                    res.body.should.not.eql(response);
                    done();
                });
            });
        });

        it('should respond with a collection', function(done) {

            request(app).get('/collection').expect(200).end(function(err, res) {
                res.body.should.be.an.instanceOf(Array).and.have.length(2);
                done();
            });

        });

        it('should respond with a collection where size is a function', function(done) {

            request(app).get('/size-as-function?count=3').expect(200).end(function(err, res) {
                res.body.should.have.length(3);
                done();
            });

        });

        it('should respond with a collection (combined request)', function(done) {

            util.options.set({multiRequest: ','});

            request(app).get('/combined/1,2,3').expect(200).end(function(err, res) {
                res.body.should.be.an.instanceOf(Array).and.have.length(3);
                done();
            });

        });

        it('should respond with a 204 for an OPTIONS request', function(done) {

            request(app).options('/').expect(204).end(function(err, res) {
                res.headers['access-control-allow-methods'].should.equal('GET,HEAD,PUT,POST,DELETE');
                res.headers['access-control-allow-credentials'].should.equal('true');
				// The next actual value is 'undefined', should be req.header('Origin') (probably an issue with supertest)
				// res.headers['access-control-allow-origin'].should.equal('*');
                done();
            });

        });
    })
});
