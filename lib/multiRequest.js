var http = require('http'),
    _ = require('lodash'),
    when = require('when');

var hostname = 'localhost',
    port = 3000;

var configure = function(options) {
    hostname = options.hostname || hostname;
    port = options.port || port;
};

var isMultiRequest = function(path) {
    var fragments = path.split('/');
    return _.find(fragments, function(fragment) {
        return fragment.indexOf(',') > -1;
    });
};

var doMultiRequest = function(path) {

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
    configure: configure,
    isMultiRequest: isMultiRequest,
    doMultiRequest: doMultiRequest
};
