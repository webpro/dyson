var request = require('supertest'),
    dyson = require('../lib/dyson'),
    defaults = require('../lib/get/defaults');

describe('get.defaults', function() {

    describe('.assign', function() {

        it('should apply defaults (and not overwrite existing values)', function() {

            var config = {
                path: '',
                template: {}
            };

            defaults.assign(config);

            config.should.have.property('cache').and.be.a('boolean');
            config.should.have.property('size');
            config.should.have.property('collection').and.be.a('boolean');
            config.should.have.property('callback').and.be.a('function');

            config.should.have.property('path').and.equal(config.path);
            config.should.have.property('template').and.equal(config.template);

        });
    });

    describe('.setValues', function() {

        it('should render data based on template', function() {

            var template = {
                myFunction: function() {
                    return 'my function';
                },
                myString: 'my string',
                myBoolean: true,
                myNumber: 42,
                myArray: [1,2,3],
                myObject: {
                    myNestedObject: {
                        myOtherFunction: function() {
                            return 'my other function'
                        },
                        myOtherString: 'my other string'
                    }
                }
            };

            var actual = defaults.setValues(template);

            var expected = {
                myFunction: 'my function',
                myString: 'my string',
                myBoolean: true,
                myNumber: 42,
                myArray: [1,2,3],
                myObject: {
                    myNestedObject: {
                        myOtherFunction: 'my other function',
                        myOtherString: 'my other string'
                    }
                }
            };

            actual.should.eql(expected);
        })
    })

    describe('routes [integration]', function() {

        var app,
            configs;

        before(function() {

            app = dyson.initExpress();

            // The `dyson.generators.id` method returns a new, unique id when it is called starting at 0 (it's actually _.uniqueId).,
            // this comes in handy when testing whether a response was cached or not.

            configs = {
                'get': [{
                    path: '/cache',
                    template: {
                        id: dyson.generators.id
                    }
                }, {
                    path: '/nocache',
                    cache: false,
                    template: {
                        id: dyson.generators.id
                    }
                }, {
                    path: '/collection',
                    collection: true,
                    size: 2,
                    template: {
                        id: dyson.generators.id
                    }
                }, {
                    path: '/randomTime',
                    template: {
                        time: dyson.generators.time.byQuarter
                    }
                }]
            };

            defaults.assign(configs.get);

            dyson.registerServices(app, configs);

        });

        it('should respond with a cached response', function(done) {

            request(app).get('/cache').end(function(err, res) {

                res.body.should.eql({"id": 0});

                request(app).get('/cache').expect(200, {"id": 0}, done);

            });

        });

        it('should respond with a non-cached response', function(done) {

            request(app).get('/nocache').end(function(err, res) {

                res.body.should.eql({"id": 1});

                request(app).get('/nocache').expect(200, {"id": 2}, done);

            });

        });

        it('should respond with a collection', function(done) {

            request(app).get('/collection').expect(200, [{"id": 3}, {"id": 4}]).end(done);

        });

        it('should respond with a randomly generated time', function(done) {

            request(app).get('/randomTime').end(function(errors, res) {

                res.body.time.should.match(/^[012][0-9]:[0134][05]$/);
                done();

            });
        });
    })
});
