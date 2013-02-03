var imageRequest = require('../lib/imageRequest'),
    express = require('express');

var imageDir = __dirname + '/dummy';

describe('dyson.imageRequest', function() {

    describe('.imageRequest', function() {

        it('should return a promise', function() {

            var actual = imageRequest.imageRequest();

            actual.should.have.property('then');
            actual.then.should.be.a('function');

        });

        it('should resolve its promise with an object: {mimeType, buffer}', function(done) {

            // Serve an actual image at http://127.0.0.1:3001/image.png
            express().use(express.static(imageDir)).listen(3001);

            imageRequest.imageRequest({
                host: 'http://127.0.0.1:3001',
                path: '/image.png'
            }).then(function(actual) {

                actual.mimeType.should.equal('image/png');
                Buffer.isBuffer(actual.buffer).should.be.true;
                done();

            });
        })
    });
});
