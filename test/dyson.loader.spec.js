var loader = require('../lib/loader');

var configDir = __dirname + '/dummy';

describe('dyson.config.loader', function() {

    describe('.load', function() {

        it('should return configuration for each method found', function() {

            var configs = loader.load(configDir);

            configs.should.be.type('object').and.have.keys('delete', 'get', 'post', 'put');

            configs.get[0].should.have.property('path');

        });
    });
});
