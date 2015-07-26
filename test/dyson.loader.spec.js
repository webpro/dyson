var loader = require('../lib/loader');

var configDir = __dirname + '/dummy';

describe('dyson.config.loader', function() {

    describe('.load', function() {

        it('should return configuration for each method found', function() {

            var configs = loader.load(configDir);

            configs.should.be.an.Object.and.have.keys('delete', 'get', 'post', 'put', 'patch');

            configs.get[0].should.have.property('path');

        });

        it('should return configurations from nested directories', function() {

            var configs = loader.load(configDir);

            configs.get.should.have.length(3);

            configs.get[2].should.have.property('path').and.equal('/dummy-three');

            configs.patch[0].should.have.property('path').and.equal('/dummy-four');

        });

    });
});
