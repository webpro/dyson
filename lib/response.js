const multiRequest = require('./multiRequest'),
    util = require('./util'),
    _ = require('lodash'),
    when = require('when');

const cache = {};
const generate = function(req, res, next) { // Arrow function breaks this? Weird!
    const service = res.locals.config,
        path = req.url,
        exposeRequest = service.exposeRequest || util.options.get('exposeRequest') && service.exposeRequest !== false;
    const templateArgs = exposeRequest ? [req] : [req.params, req.query, req.body, req.cookies, req.headers],
        containerArgs = exposeRequest ? [req] : [req.params, req.query];

    if(_.isFunction(service.status)) {
        service.status.apply(service, arguments);
    }

    if(!(service.cache && cache[path])) {
        if(!multiRequest.isMultiRequest(path)) {
            const isCollection = _.isFunction(service.collection) ? service.collection.apply(service, templateArgs) : service.collection,
                template = _.isFunction(service.template) ? service.template.apply(service, templateArgs) : service.template;
            let promise;

            if(!isCollection) {
                promise = setValues(template, templateArgs);
            } else {
                const size = _.isFunction(service.size) ? service.size.apply(service, templateArgs) : service.size;
                promise = when.map(_.times(parseInt(size, 10)), () => setValues(template, templateArgs));
            }

            promise.then(data => {
                return !service.container ? data : setValues(_.result(service, 'container'), containerArgs.concat([data]), service);
            }).then(data => {
                res.body = cache[path] = data;
                util.log('Resolving response for', req.method, path);
                next();
            });

        } else {
            when.all(multiRequest.doMultiRequest(req, path)).then(data => {
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

const setValues = (template = null, params, scope) => {
    return when.promise(resolve => {
        const promises = [],
            obj = _.isArray(template) ? [] : Object.create(template);
        _.forEach(template, (value, key) => {
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
        when.all(promises).then(() => resolve(obj));
    });
};

const render = (req, res) => {
    res.send(res.body);
};

module.exports = {
    generate,
    render,
    // Only export for unit tests
    setValues: util.isTest() ? setValues : undefined
};
