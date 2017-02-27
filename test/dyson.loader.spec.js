const loader = require('../lib/loader');

const configDir = __dirname + '/dummy';

describe('dyson.config.loader', () => {

  describe('.load', () => {

    it('should return configuration for each method found', () => {

      const configs = loader.load(configDir);

      configs.should.be.an.Object().and.have.keys('delete', 'get', 'post', 'put', 'patch', 'options');

      configs.get[0].should.have.property('path');

    });

    it('should return configurations from nested directories', () => {

      const configs = loader.load(configDir);

      configs.get.should.have.length(4);

      configs.get[2].should.have.property('path').and.equal('/dummy-three');

      configs.patch[0].should.have.property('path').and.equal('/dummy-four');

    });

  });
});
