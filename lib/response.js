const multiRequest = require('./multiRequest');
const _ = require('lodash');

const cache = {};

const result = (prop, args) => (_.isFunction(prop) ? prop(...args) : prop);

const generate = (req, res, next) => {
  const { config } = res.locals;
  const options = res.app.get('dyson_options');
  const { log } = res.app.get('dyson_logger');
  const path = req.url;
  const exposeRequest = config.exposeRequest || (options.exposeRequest && config.exposeRequest !== false);

  const templateArgs = exposeRequest ? [req] : [req.params, req.query, req.body, req.cookies, req.headers];
  const containerArgs = exposeRequest ? [req] : [req.params, req.query];

  if (config.cache && cache[path]) {
    log('Resolving response for', req.method, path, '(cached)');
    res.body = cache[path];
    return next();
  }

  if (multiRequest.isMultiRequest(path, options)) {
    Promise.all(multiRequest.doMultiRequest(req, path)).then(data => {
      res.body = cache[path] = data;
      log('Resolving response for:', req.method, path, '(multiRequest)');
      next();
    });
    return;
  }

  const template = result(config.template, templateArgs);
  const isCollection = result(config.collection, templateArgs);
  const size = result(config.size, templateArgs);

  const responseAwait = !isCollection
    ? assembleResponse(template, templateArgs)
    : Promise.all(_.times(size, () => assembleResponse(template, templateArgs)));

  responseAwait
    .then(
      response =>
        !config.container
          ? response
          : assembleResponse(_.result(config, 'container'), [...containerArgs, response], config)
    )
    .then(data => {
      res.body = cache[path] = data;
      log('Resolving response for', req.method, path);
      next();
    });
};

const isPromiseLike = obj => _.isObject(obj) && 'then' in obj;

const assembleResponse = (template = null, params, scope) =>
  Promise.resolve().then(() => {
    if (!template) return null;
    if (typeof template === 'string') return template;
    if (isPromiseLike(template)) return template;

    const obj = _.isArray(template) ? [] : Object.create(template);

    return Promise.all(
      _.map(template, (value, key) => {
        if (template.hasOwnProperty(key)) {
          obj[key] = _.isFunction(value)
            ? value.apply(scope || obj, params)
            : _.isPlainObject(value) ? assembleResponse(value, params, obj) : value;
          if (isPromiseLike(obj[key])) {
            return obj[key].then(value => {
              obj[key] = value;
            });
          }
        }
      })
    ).then(() => obj);
  });

const render = (req, res) => res.send(res.body);

module.exports = {
  generate,
  render,
  assembleResponse
};
