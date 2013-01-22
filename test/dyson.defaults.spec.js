var request = require('supertest'),
    defaults = require('../lib/defaults');

describe('dyson.config.defaults', function() {

    describe('.assign', function() {

        it('should apply defaults (and not overwrite existing values)', function() {

            var config = {
                path: '',
                template: {}
            };

            defaults.assign(config, 'get');

            config.should.have.property('cache').and.be.a('boolean');
            config.should.have.property('size');
            config.should.have.property('collection').and.be.a('boolean');
            config.should.have.property('callback').and.be.a('function');

            config.should.have.property('path').and.equal(config.path);
            config.should.have.property('template').and.equal(config.template);

        });
    });
});
