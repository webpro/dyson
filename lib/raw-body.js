module.exports = function(options) {
    var propName = options && options.property || 'rawBody';
    return function(req, res, next) {
        var data = '';
        req.on('data', function(chunk) {
            data += chunk;
        });
        req.on('end', function() {
            req[propName] = data;
        });
        next();
    };
};
