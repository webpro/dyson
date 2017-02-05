const request = require('request'),
    Stream = require('stream'),
    util = require('./util');

const proxyMiddleware = (req, res) => {
    const proxyHost = util.options.get('proxyHost'),
        proxyPort = util.options.get('proxyPort'),
        proxyURI = `${proxyHost}${proxyPort ? `:${proxyPort}` : ''}${req.url}`;
    let readStream;
    util.log('Proxying', req.url, 'to', proxyURI);
    if(req._body) {
        readStream = new Stream.Readable();
        readStream._read = function() {
            this.push(req.rawBody);
            this.push(null);
        };
    } else {
        readStream = req;
    }

    readStream.pipe(request({
        method: req.method,
        url: proxyURI,
        headers: req.headers
    }, error => {
        if(error) {
            util.error(`500 INTERNAL SERVER ERROR: ${proxyURI}`);
            res.writeHead(500);
            res.end();
        }
    })).pipe(res);
};

module.exports = {
    middleware: proxyMiddleware
};
