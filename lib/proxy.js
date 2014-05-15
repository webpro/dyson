var request = require('request'),
    util = require('./util');

var proxyMiddleware = function(req, res) {

    var proxyHost = util.options.get('proxyHost'),
        proxyPort = util.options.get('proxyPort'),
        proxyURI = proxyHost + (proxyPort ? ':' + proxyPort : '') + req.url,
        method = (req.method === 'DELETE' ? 'DEL' : req.method).toLowerCase();

    util.log('Proxying', req.url, 'to', proxyURI);

    req.pipe(request[method](proxyURI, function(error) {
        if(error) {
            util.error('500 INTERNAL SERVER ERROR:', proxyURI);
            res.writeHead(500);
            res.end();
        }
    })).pipe(res);
};

module.exports = {
    middleware: proxyMiddleware
};
