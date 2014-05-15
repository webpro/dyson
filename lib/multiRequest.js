var util = require('./util'),
    _ = require('lodash'),
    when = require('when'),
    http = require('http');

var isMultiRequest = function(path) {
    var delimiter = util.options.get('multiRequest');
    if(!delimiter) {
        return false;
    }
    var fragments = path.split('/');
    return _.find(fragments, function(fragment) {
        return fragment.indexOf(delimiter) > -1;
    });
};

var doMultiRequest = function(req, path) {

    var host = req.headers.host.split(':'),
        hostname = host[0],
        port = host[1],
        delimiter = util.options.get('multiRequest');

    var promises = [];

    var range = isMultiRequest(path);

    _.each(range.split(delimiter), function(id, index, list) {

        var d = when.defer(),
            data = '',
            url = path.replace(list, id);

        promises.push(d.promise);

        http.get({hostname: hostname, port: port, path: url}, function(res) {
            res.on('data', function(chunk) {
                data += chunk;
            });
            res.on('end', function(chunk) {
                d.resolve(JSON.parse(data));
            });
        }).on('error', function(error) {
            console.log(error.message);
        });
    });

    return promises;

};

module.exports = {
    isMultiRequest: isMultiRequest,
    doMultiRequest: doMultiRequest
};
