var http = require('http'),
    _ = require('lodash'),
    when = require('when');

var isMultiRequest = function(path) {
    var fragments = path.split('/');
    return _.find(fragments, function(fragment) {
        return fragment.indexOf(',') > -1;
    });
};

var doMultiRequest = function(req, path) {

    var host = req.headers.host.split(':'),
        hostname = host[0],
        port = host[1];

    var promises = [];

    var range = isMultiRequest(path);

    _.each(range.split(','), function(id, index, list) {

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
