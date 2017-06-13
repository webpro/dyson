const request = require('request'),
  Stream = require('stream'),
  util = require('./util'),
  _ = require('lodash');

const proxyMiddleware = (req, res) => {
  const options = req.app.get('dyson_options'),
    proxyHost = options.proxyHost,
    proxyPort = options.proxyPort,
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
    headers: _.omit(req.headers, ['host'])
  }, error => {
    if(error) {
      /* eslint-disable no-console */
      console.error(`500 INTERNAL SERVER ERROR: ${proxyURI}`);
      console.error(error);
      res.writeHead(500);
      res.end();
    }
  })).pipe(res);
};

module.exports = {
  middleware: proxyMiddleware
};
