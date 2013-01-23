var request = require('supertest'),
    dyson = require('../lib/dyson');

describe('dyson', function() {

    describe('.registerServices', function() {

        var app = dyson.initExpress();

        var configs = {
            'get': [{
                path: '/user',
                template: {
                    id: 1
                },
                callback: function(){},
                render: function(){}
            }],
            'post': [{
                path: '/user',
                callback: function(){},
                render: function(){}
            }]
        };

        it('should add routes to Express', function() {

            dyson.registerServices(app, configs);

            app.routes.get[0].path.should.equal('/user');
            app.routes.get[0].method.should.equal('get');

            app.routes.post[0].path.should.equal('/user');
            app.routes.post[0].method.should.equal('post');

        });
    });

    describe('routes', function() {

        var app,
            render,
            configs;

        before(function() {

            app = dyson.initExpress();

            render = function(req, res) {
                res.send(200, res.body);
            };

            configs = {
                'get': [{
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
                'post': [{
                    path: '/user',
                    callback: function(req, res, next) {
                        res.body = {saved: true};
                        next();
                    },
                    render: render
                }]
            };

            dyson.registerServices(app, configs);

        });

        it('should respond with body based on template and custom callback', function(done) {

            request(app).get('/user/1').expect(200, {"id": 1, "name": "John"}, done);

        });

        it('should respond with body based on callback', function(done) {

            request(app).post('/user').expect(200, {"saved": true}, done);

        });
    });
});
