var multiRequest = require('./multiRequest'),
    util = require('./util'),
    _ = require('lodash'),
    when = require('when');

var cache = {};

var generate = function(req, res, next) {

    var service = this,
        path = req.url,
        params = req.params,
        query = req.query,
        body = req.body,
		cookies = req.cookies;

    if(_.isFunction(service.status)) {
        service.status.apply(service, arguments);
    }

    if(!(service.cache && cache[path])) {

        if(!multiRequest.isMultiRequest(path)) {

            var template = _.isFunction(service.template) ? service.template.apply(service, [params, query, body, cookies]) : service.template,
                promise;

            if(!service.collection) {

                promise = setValues(template, [params, query, body, cookies]);

            } else {

                promise = when.all(_.times(_.result(service, 'size'), function() {
                    return setValues(template, [params, query, body, cookies]);
                }));
            }

            promise.then(function(data) {
                return !service.container ? data : setValues(_.result(service, 'container'), [params, query, data], service);
            }).then(function(data) {
                res.body = cache[path] = data;
                util.log('Resolving response for', path);
                next();
            });

        } else {

            when.all(multiRequest.doMultiRequest(req, path), function(data) {

                res.body = cache[path] = data;

                util.log('Resolving response for:', path, '(multiRequest)');

                next();

            });
        }

    } else {

        util.log('Resolving response for', path, '(cached)');

        res.body = cache[path];

        next();

    }
};

var setValues = function(template, params, scope) {

    var deferred = when.defer(),
        promises = [],
        obj = Object.create(template);

    _.each(template, function(value, key) {

        obj[key] = _.isFunction(value) ? value.apply(scope || obj, params) : _.isPlainObject(value) ? setValues(value, params, obj) : value;

        if(when.isPromise(obj[key])) {
            promises.push(obj[key]);
            obj[key].then(function(value) {
                obj[key] = value;
            });
        }
    });

    when.all(promises, function() {
        deferred.resolve(obj);
    });

    return deferred.promise;
};

var render = function(req, res) {
    res.send(res.body);
};

module.exports = {
    generate: generate,
    render: render,
    // Only export for unit tests
    setValues: util.isTest() ? setValues : undefined
};
