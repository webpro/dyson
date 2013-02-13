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
        imgSrc: function() {
            return g.image.src({width:150, height: 150});
        },
        imgSrc_custom: function() {
            return 'http://placekitten.com/200/300';
        },
        status: 'OK'
    }
};
