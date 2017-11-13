const http = require('http');

const isMultiRequest = (path, options) => {
  const delimiter = options.multiRequest;
  if (!delimiter) {
    return false;
  }
  return path.split('/').find(fragment => fragment.includes(delimiter));
};

const doMultiRequest = (req, path) => {
  const options = req.app.get('dyson_options');
  const { err } = req.app.get('dyson_logger');
  const [hostname, port] = req.headers.host.split(':');
  const delimiter = options.multiRequest;
  const range = isMultiRequest(path, options);

  return range.split(delimiter).map((id, index, list) => {
    const url = path.replace(list, id);
    let data = '';

    return new Promise((resolve, reject) => {
      http
        .get({ hostname, port, path: url }, res => {
          res.on('data', chunk => {
            data += chunk;
          });
          res.on('end', () => {
            resolve(JSON.parse(data));
          });
        })
        .on('error', error => {
          err(error.message);
          reject(error);
        });
    });
  });
};

module.exports.isMultiRequest = isMultiRequest;
module.exports.doMultiRequest = doMultiRequest;
