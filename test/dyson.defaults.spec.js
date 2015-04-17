var defaults = require('../lib/defaults');

describe('dyson.config.defaults', function() {

    describe('.assign', function() {

        it('should apply defaults (and not overwrite existing values)', function() {

            var config = {
                path: '/test',
                template: {}
            };

            defaults.assign(config, 'get');

            config.should.have.property('cache').and.be.type('boolean');
            config.should.have.property('size');
            config.should.have.property('collection').and.be.type('boolean');
            config.should.have.property('callback').and.be.type('function');

            config.should.have.property('path').and.equal(config.path);
            config.should.have.property('template').and.equal(config.template);

        });

        it('should bind config methods to the config', function() {

            var config = {
                path: '/test',
                template: {},
                callback: function() {
                    this._counter++;
                    return this;
                },
                render: function() {
                    this._counter++;
                },
                _counter: 0
            };

            defaults.assign(config, 'get');

            config.callback().render();

            config._counter.should.equal(2);

        });
    });
});
