var sinon = require('sinon'),
    dyson = require('../lib/dyson'),
    when = require('when'),
    util = require('../lib/util'),
    configDefaults = require('../lib/response');

describe('dyson.response', function() {

    describe('.setValues', function() {

        it('should return a promise', function() {

            var actual = configDefaults.setValues({});

            actual.should.have.property('then');
            actual.then.should.be.a.Function;
        });

        it('should render data based on template', function(done) {

            var template = {
                myFunction: function() {
                    return 'my function';
                },
                myString: 'my string',
                myBoolean: true,
                myNumber: 42,
                myArray: [1, 2, 3]
            };

            var expected = {
                myFunction: 'my function',
                myString: 'my string',
                myBoolean: true,
                myNumber: 42,
                myArray: [1, 2, 3]
            };

            configDefaults.setValues(template).then(function(actual) {
                actual.should.eql(expected);
                done();

            });
        });

        it('should return an array', function(done) {

            var template = [
                function() {
                    return 'my function';
                },
                2,
                {}
            ];

            var expected = [
                'my function',
                2,
                {}
            ];

            configDefaults.setValues(template).then(function(actual) {
                actual.should.be.an.Array();
                actual.should.eql(expected);
                done();

            });
        });

        it('should parse template objects iteratively', function(done) {

            var template = {
                myObject: {
                    myNestedObject: {
                        myDeepFunction: function() {
                            return 'my other function'
                        },
                        myDeepString: 'my other string'
                    }
                }
            };

            var expected = {
                myObject: {
                    myNestedObject: {
                        myDeepFunction: 'my other function',
                        myDeepString: 'my other string'
                    }
                }
            };

            configDefaults.setValues(template).then(function(actual) {

                actual.should.eql(expected);
                done();

            });
        });

        it('should replace a promise with its resolved value', function(done) {

            var template = {
                myPromise: function() {
                    var deferred = when.defer();
                    setTimeout(function() {
                        deferred.resolve('my promise');
                    }, 10);
                    return deferred.promise;
                }
            };

            var expected = {
                myPromise: 'my promise'
            };

            configDefaults.setValues(template).then(function(actual) {

                actual.should.eql(expected);
                done();

            });
        });
    });

    describe('.generate', function() {

        describe('with option exposeRequest', function() {

            var services, req, res, next;

            before(function() {

                services = {
                    truthy: {
                        path: '/true',
                        exposeRequest: true,
                        template: sinon.spy()
                    },
                    falsy: {
                        path: '/false',
                        exposeRequest: false,
                        template: sinon.spy()
                    },
                    undef: {
                        path: '/undefined',
                        exposeRequest: true,
                        template: sinon.spy()
                    }
                };

                req = {
                    params: {},
                    query: {},
                    body: {},
                    cookies: {},
                    headers: {}
                };

                res = {
                    locals:{}
                };

                next = function() {};

            });

            describe('set to true', function() {

                var service;

                before(function() {

                    util.options.set({
                        exposeRequest: true
                    });

                    res.locals.config = {
                        path: '/container',
                        template: sinon.spy(),
                        container: {
                            foo: sinon.spy()
                        }
                    };

                });

                it('should expose request to template', function() {

                    configDefaults.generate(req, res, next);

                    sinon.assert.calledWithExactly(res.locals.config.template, req);

                });

                it('should expose request to container', function() {

                    configDefaults.generate(req, res, next);

                    sinon.assert.calledWithExactly(res.locals.config.container.foo, req, sinon.match.object);

                });
            });

            describe('globally falsy', function() {

                before(function() {

                    util.options.set({
                        exposeRequest: false
                    });

                });

                it('should expose request to templates if local option is truthy', function() {

                    res.locals.config = services.truthy;

                    configDefaults.generate(req, res, next);

                    sinon.assert.calledWithExactly(res.locals.config.template, req);

                });

                it('should not expose request to templates if local option is falsy', function() {

                    res.locals.config = services.falsy;

                    configDefaults.generate(req, res, next);

                    sinon.assert.calledWithExactly(
                        res.locals.config.template,
                        sinon.match.same(req.params),
                        sinon.match.same(req.query),
                        sinon.match.same(req.body),
                        sinon.match.same(req.cookies),
                        sinon.match.same(req.headers));

                });
            });

            describe('globally truthy', function() {

                before(function() {

                    util.options.set({
                        exposeRequest: true
                    });

                });

                it('should expose request to templates if local option is truthy', function() {

                    res.locals.config = services.truthy;

                    configDefaults.generate(req, res, next);

                    sinon.assert.calledWithExactly(res.locals.config.template, req);

                });

                it('should expose request to templates if local option is undefined', function() {

                    configDefaults.generate(req, res, next);

                    sinon.assert.calledWithExactly(res.locals.config.template, req);

                });

                it('should not expose request to templates if local option is false', function() {

                    res.locals.config = services.falsy;

                    configDefaults.generate(req, res, next);

                    sinon.assert.calledWithExactly(
                        res.locals.config.template,
                        sinon.match.same(req.params),
                        sinon.match.same(req.query),
                        sinon.match.same(req.body),
                        sinon.match.same(req.cookies),
                        sinon.match.same(req.headers));

                });
            });
        });
    });
});
