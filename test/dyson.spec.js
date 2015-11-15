var dyson = require('../lib/dyson'),
    request = require('supertest'),
    express = require('express'),
    sinon = require('sinon');

describe('dyson', function() {

    var app = express(),
        options = {};

    describe('.registerServices', function() {

        before(function() {
            dyson.registerServices(app, options, {
                get: [
                    {
                        path: '/',
                        callback: function() {},
                        render: function() {}
                    }
                ]
            });
        });

        it('should add GET route to Express', function() {

            var spy = sinon.spy(app, 'get');

            var config = {
                get: [
                    {
                        path: '/endpoint',
                        callback: function() {},
                        render: function() {}
                    }
                ]
            };

            dyson.registerServices(app, options, config);

            spy.callCount.should.equal(1);
            spy.firstCall.args[0].should.equal(config.get[0].path);
            spy.firstCall.args.should.containEql(config.get[0].callback);
            spy.firstCall.args.should.containEql(config.get[0].render);

            app.get.restore();

        });

        it('should add POST route to Express', function() {

            var spy = sinon.spy(app, 'post');

            var config = {
                post: [
                    {
                        path: '/endpoint',
                        callback: function() {},
                        render: function() {}
                    }
                ]
            };

            dyson.registerServices(app, options, config);

            spy.callCount.should.equal(1);
            spy.firstCall.args[0].should.equal(config.post[0].path);
            spy.firstCall.args.should.containEql(config.post[0].callback);
            spy.firstCall.args.should.containEql(config.post[0].render);

            app.post.restore();

        });
    });

    describe('routes', function() {

        before(function() {

            var render = function(req, res) {
                res.status(200).send(res.body)
            };

            var configs = {
                get: [
                    {
                        path: '/user/:id',
                        template: {
                            id: function(params) {
                                return params.id;
                            },
                            name: 'John'
                        },
                        callback: function(req, res, next) {
                            var template = configs.get[0].template;
                            res.body = {
                                id: template.id(req.params),
                                name: template.name
                            };
                            next();
                        },
                        render: render
                    }
                ],
                post: [
                    {
                        path: '/user',
                        callback: function(req, res, next) {
                            res.body = {saved: true};
                            next();
                        },
                        render: render
                    }
                ]
            };

            dyson.registerServices(app, options, configs);

        });

        it('should respond with body based on template and custom callback', function(done) {

            request(app).get('/user/1').expect(200, {"id": 1, "name": "John"}, done);

        });

        it('should respond with body based on callback', function(done) {

            request(app).post('/user').expect(200, {"saved": true}, done);

        });
    });
});
