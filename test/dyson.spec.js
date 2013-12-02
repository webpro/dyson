var dyson = require('../lib/dyson'),
    request = require('supertest'),
    express = require('express');

describe('dyson', function() {

    var app = express(),
        options = {};

    describe('.registerServices', function() {

        it('should add routes to Express', function() {

            var configs = {
                get: [{
                    path: '/endpointA',
                    template: {
                        id: 1
                    },
                    callback: function(){},
                    render: function(){}
                }],
                post: [{
                    path: '/endpointB',
                    callback: function(){},
                    render: function(){}
                }]
            };

            dyson.registerServices(app, options, configs);

            var route;

            route = app.routes.get[app.routes.get.length-1];
            route.path.should.equal('/endpointA');
            route.method.should.equal('get');

            route = app.routes.post[app.routes.post.length-1];
            route.path.should.equal('/endpointB');
            route.method.should.equal('post');

        });
    });

    describe('routes', function() {

        before(function() {

            var render = function(req, res) {
                res.send(200, res.body);
            };

            var configs = {
                get: [{
                    path: '/user/:id',
                    template: {
                        id: function(params) {
                            return params.id;
                        },
                        name: 'John'
                    },
                    callback: function(req, res, next) {
                        res.body = {
                            id: this.template.id(req.params),
                            name: this.template.name
                        };
                        next();
                    },
                    render: render
                }],
                post: [{
                    path: '/user',
                    callback: function(req, res, next) {
                        res.body = {saved: true};
                        next();
                    },
                    render: render
                }]
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
