var g = require('dyson-generators');

module.exports = {
	path: '/images',
	template: {
        imgBase64: function() {
            return g.image.base64({width:200, height: 200});
        },
        imgBase64_custom: function() {
            return g.image.base64({
                host: 'http://lorempixel.com',
                path: '/150/150/abstract/' + g.random(10)
            });
        },
        imgSrc: 'http://localhost:3000/image/150x150',
        imgSrc_external: 'http://placekitten.com/200/300',
        status: 'OK'
    }
};
