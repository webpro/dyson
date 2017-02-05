const util = require('./util'),
    when = require('when'),
    http = require('http');

const isMultiRequest = path => {
    const delimiter = util.options.get('multiRequest');
    if(!delimiter) {
        return false;
    }
    return path.split('/').find(fragment => fragment.includes(delimiter));
};

const doMultiRequest = (req, path) => {
    const host = req.headers.host.split(':'),
        hostname = host[0],
        port = host[1],
        delimiter = util.options.get('multiRequest'),
        promises = [],
        range = isMultiRequest(path);

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
            console.error(error.message);
        });
    });

    return promises;

};

module.exports = {
    isMultiRequest,
    doMultiRequest
};
