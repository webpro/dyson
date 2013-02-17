var image = require('dyson-image');

module.exports = {
    path: '/image/*',
    callback: image.asMiddleware
};
