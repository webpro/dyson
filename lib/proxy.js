const request = require('request');
const Stream = require('stream');
const _ = require('lodash');

module.exports = (req, res) => {
  const { log, err } = req.app.get('dyson_logger');
  const options = req.app.get('dyson_options');
  const { proxyHost, proxyPort } = options;
  const proxyURI = `${proxyHost}${proxyPort ? `:${proxyPort}` : ''}${req.url}`;

  let readStream;

  log(`Proxying ${req.url} to ${proxyURI}`);

  if (req._body) {
    readStream = new Stream.Readable();
    readStream._read = function() {
      this.push(req.rawBody);
      this.push(null);
    };
  } else {
    readStream = req;
  }

  readStream
    .pipe(
      request(
        {
          method: req.method,
          url: proxyURI,
          headers: _.omit(req.headers, ['host'])
        },
        error => {
          if (error) {
            err(`500 INTERNAL SERVER ERROR: ${proxyURI}`);
            err(error);
            res.writeHead(500);
            res.end();
          }
        }
      )
    )
    .pipe(res);
};
