const when = require('when'),
  http = require('http');

const isMultiRequest = (path, options) => {
  const delimiter = options.multiRequest;
  if(!delimiter) {
    return false;
  }
  return path.split('/').find(fragment => fragment.includes(delimiter));
};

const doMultiRequest = (req, path) => {
  const options = req.app.get('dyson_options'),
    host = req.headers.host.split(':'),
    hostname = host[0],
    port = host[1],
    delimiter = options.multiRequest,
    promises = [],
    range = isMultiRequest(path, options);

  range.split(delimiter).forEach((id, index, list) => {
    const d = when.defer(),
      url = path.replace(list, id);
    let data = '';

    promises.push(d.promise);

    http.get({ hostname, port, path: url }, res => {
      res.on('data', chunk => {
        data += chunk;
      });
      res.on('end', () => {
        d.resolve(JSON.parse(data));
      });
    }).on('error', error => {
      /* eslint-disable no-console */
      console.error(error.message);
    });
  });

  return promises;

};

module.exports = {
  isMultiRequest,
  doMultiRequest
};
