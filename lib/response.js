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

            var isCollection = _.isFunction(service.collection) ? service.collection.apply(service, [params, query, body, cookies]) : service.collection,
                template = service.template,
                promise;

            if(!isCollection) {

                promise = setValues(template, [params, query, body, cookies]);

            } else {

                var size = _.isFunction(service.size) ? service.size.apply(service, [params, query, body, cookies]) : service.size;

                promise = when.map(_.times(parseInt(size, 10)), function() {
                    return setValues(template, [params, query, body, cookies]);
                });
            }

            promise.then(function(data) {
                return !service.container ? data : setValues(_.result(service, 'container'), [params, query, data], service);
            }).then(function(data) {
                res.body = cache[path] = data;
                util.log('Resolving response for', req.method, path);
                next();
            });

        } else {

            when.all(multiRequest.doMultiRequest(req, path)).then(function(data) {

                res.body = cache[path] = data;

                util.log('Resolving response for:', req.method, path, '(multiRequest)');

                next();

            });
        }

    } else {

        util.log('Resolving response for', req.method, path, '(cached)');

        res.body = cache[path];

        next();

    }
};

var setValues = function(template, params, scope) {

    template = template || null;
    template = _.isFunction(template) ? template.apply(this, params) : template;

    return when.promise(function(resolve, reject, notify) {

        var promises = [],
            obj = _.isArray(template) ? [] : Object.create(template);

        _.forEach(template, function(value, key) {
            if(template.hasOwnProperty(key)) {
                obj[key] = _.isFunction(value) ? value.apply(scope || obj, params) : _.isPlainObject(value) ? setValues(value, params, obj) : value;

                if(when.isPromiseLike(obj[key])) {
                    promises.push(obj[key]);
                    obj[key].then(function(key, value) {
                        obj[key] = value;
                    }.bind(obj, key));
                }
            }
        });

        when.all(promises).then(function() {
            resolve(obj);
        });

    });
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
