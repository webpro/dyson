var request = require('request'),
    util = require('./util');

var proxyMiddleware = function(req, res) {

    var proxyHost = util.options.get('proxyHost'),
        proxyPort = util.options.get('proxyPort'),
        proxyURI = proxyHost + (proxyPort ? ':' + proxyPort : '') + req.url;

    util.log('Proxying', req.url, 'to', proxyURI);

    var stream;
    if (req._body) {
        stream = new require('stream').Readable();
        stream._read = function(size) {
            this.push(req.rawBody);
            this.push(null);
        };
    } else {
        stream = req;
    }

    stream.pipe(request({
        method: req.method,
        url: proxyURI,
        headers: req.headers
    }, function(error) {
        if(error) {
            util.error('500 INTERNAL SERVER ERROR:', proxyURI);
            res.writeHead(500);
            res.end();
        }
    })).pipe(res)
};

module.exports = {
    middleware: proxyMiddleware
};
