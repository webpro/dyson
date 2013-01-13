var _ = require('lodash'),
    when = require('when'),
    multiRequest = require('../dyson').multiRequest;

var cache = {};

var setValues = function(template, params, scope) {
    var obj = Object.create(template);
    _.each(template, function(value, key) {
        obj[key] = _.isFunction(value) ? value.apply(scope || obj, params) : _.isObject(value) ? setValues(value, params, obj) : value;
    });
    return obj;
}

var generateResponse = function(req, res, next) {

    var service = this,
        path = req.url,
        params = req.params,
        query = req.query,
        data;

    if(_.isFunction(service.status)) {
        service.status.apply(service, arguments);
    }

    if(!(service.cache && cache[path])) {

        if(!multiRequest.isMultiRequest(path)) {

            var template = _.result(service, 'template');

            if(!service.collection) {

                data = setValues(template, [params, query]);

            } else {

                data = _.times(_.result(service, 'size'), function() {
                    return setValues(template, [params, query]);
                });
            }

            if(service.container) {
                data = setValues(_.result(service, 'container'), [params, query, data], service);
            }

            res.body = cache[path] = data;

            console.log('Resolving response for', path);

            next();

        } else {

            when.all(multiRequest.doMultiRequest(path), function(data) {

                res.body = cache[path] = data;

                console.log('Resolving resDeferred for:', path, '(multiRequest)');

                next();

            });
        }

    } else {

        console.log('Resolving response for', path, '(cached)');

        res.body = cache[path];

        next();

    }
};

var defaults = {
    cache: true,
    size: function() {
        return _.random(2,10);
    },
    collection: false,
    callback: generateResponse
};

module.exports = defaults;
