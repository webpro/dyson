const dyson = require('../lib/dyson'),
  request = require('supertest'),
  express = require('express'),
  sinon = require('sinon');

describe('dyson', () => {

  const app = express(),
    options = {};

  describe('.registerServices', () => {

    const dummyConfig = {
      path: '/',
      status: () => {},
      callback: () => {},
      render: () => {}
    };

    before(() => {
      dyson.registerServices(app, options, {
        get: [dummyConfig]
      });
    });

    it('should add GET route to Express', () => {

      const spy = sinon.spy(app, 'get');

      const config = {
        get: [dummyConfig]
      };

      dyson.registerServices(app, options, config);

      spy.callCount.should.equal(1);
      spy.firstCall.args[0].should.equal(config.get[0].path);
      spy.firstCall.args.should.containEql(config.get[0].status);
      spy.firstCall.args.should.containEql(config.get[0].callback);
      spy.firstCall.args.should.containEql(config.get[0].render);

      app.get.restore();

    });

    it('should add POST route to Express', () => {

      const spy = sinon.spy(app, 'post');

      const config = {
        post: [dummyConfig]
      };

      dyson.registerServices(app, options, config);

      spy.callCount.should.equal(1);
      spy.firstCall.args[0].should.equal(config.post[0].path);
      spy.firstCall.args.should.containEql(config.post[0].callback);
      spy.firstCall.args.should.containEql(config.post[0].render);

      app.post.restore();

    });

    it('should automatically add OPTIONS route to Express', () => {

      const spy = sinon.spy(app, 'options');

      const config = {
        get: [dummyConfig]
      };

      dyson.registerServices(app, options, config);

      spy.callCount.should.equal(1);
      spy.firstCall.args[0].should.equal(config.get[0].path);
      spy.firstCall.args[1].should.be.type('function');

      app.options.restore();

    });
  });

  describe('routes', () => {

    before(() => {

      const render = (req, res) => {
        res.status(200).send(res.body);
      };

      const configs = {
        get: [
          {
            path: '/user/:id',
            template: {
              id: params => {
                return params.id;
              },
              name: 'John'
            },
            status: (req, res, next) => next(),
            callback: (req, res, next) => {
              const template = configs.get[0].template;
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
            status: (req, res, next) => next(),
            callback: (req, res, next) => {
              res.body = {saved: true};
              next();
            },
            render: render
          }
        ]
      };

      dyson.registerServices(app, options, configs);

    });

    it('should respond with body based on template and custom callback', done => {

      request(app).get('/user/1').expect(200, {'id': 1, 'name': 'John'}, done);

    });

    it('should respond with body based on callback', done => {

      request(app).post('/user').expect(200, {'saved': true}, done);

    });
  });
});
