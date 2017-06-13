const sinon = require('sinon'),
  when = require('when'),
  util = require('../lib/util'),
  configDefaults = require('../lib/response');

describe('dyson.response', () => {

  describe('.setValues', () => {

    it('should return a promise', () => {

      const actual = configDefaults.setValues({});

      actual.should.have.property('then');
      actual.then.should.be.a.Function;
    });

    it('should render data based on template', done => {

      const template = {
        myFunction: () => {
          return 'my function';
        },
        myString: 'my string',
        myBoolean: true,
        myNumber: 42,
        myArray: [1, 2, 3]
      };

      const expected = {
        myFunction: 'my function',
        myString: 'my string',
        myBoolean: true,
        myNumber: 42,
        myArray: [1, 2, 3]
      };

      configDefaults.setValues(template).then(actual => {
        actual.should.eql(expected);
        done();

      });
    });

    it('should return an array', done => {

      const template = [
        () => {
          return 'my function';
        },
        2,
        {}
      ];

      const expected = [
        'my function',
        2,
        {}
      ];

      configDefaults.setValues(template).then(actual => {
        actual.should.be.an.Array();
        actual.should.eql(expected);
        done();

      });
    });

    it('should parse template objects iteratively', done => {

      const template = {
        myObject: {
          myNestedObject: {
            myDeepFunction: () => {
              return 'my other function';
            },
            myDeepString: 'my other string'
          }
        }
      };

      const expected = {
        myObject: {
          myNestedObject: {
            myDeepFunction: 'my other function',
            myDeepString: 'my other string'
          }
        }
      };

      configDefaults.setValues(template).then(actual => {

        actual.should.eql(expected);
        done();

      });
    });

    it('should replace a promise with its resolved value', done => {

      const template = {
        myPromise: () => {
          const deferred = when.defer();
          setTimeout(() => {
            deferred.resolve('my promise');
          }, 10);
          return deferred.promise;
        }
      };

      const expected = {
        myPromise: 'my promise'
      };

      configDefaults.setValues(template).then(actual => {

        actual.should.eql(expected);
        done();

      });
    });
  });

  describe('.generate', () => {

    describe.skip('with option exposeRequest', () => {

      let services, req, res, next;

      before(() => {

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

        next = () => {};

      });

      describe('set to true', () => {

        before(() => {

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

        it('should expose request to template', () => {

          configDefaults.generate(req, res, next);

          sinon.assert.calledWithExactly(res.locals.config.template, req);

        });

        it('should expose request to container', () => {

          configDefaults.generate(req, res, next);

          sinon.assert.calledWithExactly(res.locals.config.container.foo, req, sinon.match.object);

        });
      });

      describe('globally falsy', () => {

        before(() => {

          util.options.set({
            exposeRequest: false
          });

        });

        it('should expose request to templates if local option is truthy', () => {

          res.locals.config = services.truthy;

          configDefaults.generate(req, res, next);

          sinon.assert.calledWithExactly(res.locals.config.template, req);

        });

        it('should not expose request to templates if local option is falsy', () => {

          res.locals.config = services.falsy;

          configDefaults.generate(req, res, next);

          sinon.assert.calledWithExactly(
            res.locals.config.template,
            sinon.match.same(req.params),
            sinon.match.same(req.query),
            sinon.match.same(req.body),
            sinon.match.same(req.cookies),
            sinon.match.same(req.headers)
          );
        });
      });

      describe('globally truthy', () => {

        before(() => {

          util.options.set({
            exposeRequest: true
          });

        });

        it('should expose request to templates if local option is truthy', () => {

          res.locals.config = services.truthy;

          configDefaults.generate(req, res, next);

          sinon.assert.calledWithExactly(res.locals.config.template, req);

        });

        it('should expose request to templates if local option is undefined', () => {

          configDefaults.generate(req, res, next);

          sinon.assert.calledWithExactly(res.locals.config.template, req);

        });

        it('should not expose request to templates if local option is false', () => {

          res.locals.config = services.falsy;

          configDefaults.generate(req, res, next);

          sinon.assert.calledWithExactly(
            res.locals.config.template,
            sinon.match.same(req.params),
            sinon.match.same(req.query),
            sinon.match.same(req.body),
            sinon.match.same(req.cookies),
            sinon.match.same(req.headers)
          );
        });
      });
    });
  });
});
