# dyson

Node server for dynamic, fake JSON.

``` bash
npm install dyson
```

See [installation notes](#installation). Check out some [demo services](http://dyson.jit.su).

[![Build Status](https://img.shields.io/travis/webpro/dyson.svg?style=flat)](https://travis-ci.org/webpro/dyson)
[![npm package](https://img.shields.io/npm/v/dyson.svg?style=flat)](https://www.npmjs.com/package/dyson)
[![dependencies](https://img.shields.io/david/webpro/dyson.svg?style=flat)](https://david-dm.org/webpro/dyson)
![npm version](https://img.shields.io/node/v/dyson.svg?style=flat)

## Introduction

Dyson allows you to define JSON endpoints based on a simple `template` object:

![input-output](http://webpro.github.com/dyson/input-output.png)

When developing client-side applications, for data usually either static JSON files are used, or an actual server, backend, datastore, API, you name it. Sometimes static files are too static, and sometimes an actual server is not available, not accessible, or too tedious to setup.

This is where dyson comes in. Get a full fake server for your application up and running in minutes.

## Overview

* Easy configuration, extensive options
* Dynamic responses
    * Responses can use request data (e.g. to simulate different login scenarios based on username):
        * Request path
        * GET/POST parameters
        * Cookies
    * Respond with different status code for specific requests (e.g. 404 for `?id=999`)
    * Includes random data generators
* Supports to proxy non-configured endpoints to actual services
* Supports GET, POST, PUT, DELETE, PATCH (and OPTIONS)
* Supports CORS
* Supports delayed responses
* Includes dummy image generator
    * Use any external or local image service (included)
    * Supports base64 encoded image strings
* Supports required parameter validation

## Endpoint Configuration

Configure endpoints using simple objects:

``` javascript
{
    path: '/user/:id',
    method: 'GET',
    template: {
        id: function(params, query, body) {
            return params.id;
        },
        name: g.name,
        address: {
            zip: g.zipUS,
            city: g.city
        }
    }
}
```

The `path` string is the usual argument provided to [Express](http://expressjs.com/api.html#app.VERB), as in `app.get(path, callback);`.

The `template` object may contain properties of the following types:

* function: the function will be invoked with arguments _(params, query, body, cookies)_
* string, boolean, number, array: returned as-is
* object: will be recursively iterated
* promise: if the function is a promise, it will be replaced with the resolving value

Note: the `template` can also be a _function_ returning the actual data. The template function itself is also invoked with arguments _(params, query, body, cookies)_.

## Images

In addition to configured endpoints, dyson registers a [dummy image service](http://github.com/webpro/dyson-image) at `/image`. E.g. requesting `/image/300x200` serves an image with given dimensions.

This service is a proxy to [Dynamic Dummy Image Generator](http://dummyimage.com/) by [Russell Heimlich](http://twitter.com/kingkool68).

## Defaults

The default values for the configuration objects:

``` javascript
{
    cache: false,
    delay: false,
    proxy: false,
    size: function() {
        return _.random(2,10);
    },
    collection: false,
    callback: response.generate,
    render: response.render
};
```

* `cache:true` means that multiple requests to the same path will result in the same response
* `delay:number` will delay the response with `number` milliseconds (or between `[n, m]` milliseconds)
* `proxy:false` means that requests to this file can be skipped and sent to the configured proxy
* `size:function` is the number of objects in the collection
* `collection:true` will return a collection
* `callback:function`
    * the provided default function is doing the hard work (but can be overridden)
    * used as middleware in Express
    * must set `res.body` and call `next()` to render response
* `render:function`
    * the default function to render the response (basically `res.send(200, res.body);`)
    * used as middleware in Express

## Fake data generators

You can use _anything_ to generate data. Here are some suggestions:

* [Faker.js](https://github.com/marak/Faker.js/)
* [Chance.js](http://chancejs.com/)
* [dyson-generators](http://github.com/webpro/dyson-generators)

Just install the generator(s) in your project to use them in your templates:

``` bash
npm install dyson-generators --save-dev
```

Please refer to the project pages for usage and examples (here's one [using dyson-generators](https://github.com/webpro/dyson/blob/master/dummy/get/fake.js)).


## Containers

Containers can help if you need to send along some meta data, or wrap the response data in a specific way. Just use the `container` object, and return the `data` where you want it. Functions in the `container` object are invoked with arguments _(params, query, data)_:

``` javascript
{
    path: '/users',
    template: user.template,
    container: {
        meta: function(params, query, data) {
            userCount: data.length
        },
        data: {
            all: [],
            the: {
                way: {
                    here: function(params, query, data) {
                        return data;
                    }
                }
            }
        }
    }
}
```

And an example response:

``` javascript
{
    "meta": {
        "userCount": 2
    },
    data: {
        all: [],
        the: {
            way: {
                here: [
                    {
                        "id": 412,
                        "name": "John"
                    },
                    {
                        "id": 218,
                        "name": "Olivia"
                    }
                ]
            }
        }
    }
}
```

## Combined requests

Basic support for "combined" requests is available, by means of a comma separated path fragment.

For example, a request to `/user/5,13` will result in an array of the responses from `/user/5` and `/user/13`.

The `,` delimiter can be [configured](project-configuration) (or disabled).

## Status codes

By default, all responses are sent with a status code `200` (and the `Content-Type: application/json` header).

This can be completely overridden with the `status` property, e.g.:

``` javascript
{
    path: '/feature/:foo?',
    status: function(req, res) {
        if(req.params.foo === '999') {
            res.status(404).send('Feature not found');
        }
    }
}
```

Would result in a `404` when requesting `/feature/999`.

## JSONP

Override the `render` method of the Express middleware in the endpoint definition. In the example below, depending on the existence of the `callback` parameter, either raw JSON response is returned or it is wrapped with the provided callback:

``` javascript
{
    render: function (req, res) {
        var callback = req.query.callback;
        if (callback) {
            res.append('Content-Type', 'application/javascript');
            res.send(callback + '(' + JSON.stringify(res.body) + ');');
        } else {
            res.send(res.body);
        }
    }
}
```

## HTTPS

If you want to run dyson over https:// you have to provide a self-signed (or authority-signed) certificate into the `options.https` the same way it's required for NodeJS HTTPS to work:

``` javascript
var fs = require('fs');

dyson.bootstrap({
	configDir: __dirname + '/dummy',
	port: 3001,
	https: {
    		key: fs.readFileSync(__dirname + '/certs/sample.key'),
    		crt: fs.readFileSync(__dirname + '/certs/sample.crt')
	}
});
```

*Note*: if running HTTPS on port 443, it will require `sudo` privileges.

## Installation

The recommended way to install dyson is to install it locally and put it in your `package.json`:

``` bash
npm install dyson
```

Then you can use it from an `npm-script` in `package.json` using e.g. `npm run mocks`:

``` json
"scripts": {
    "mocks": "dyson stubs"
}
```

You can also install dyson globally to start it from anywhere:

``` bash
npm install -g dyson
```

### Project

You can put your configuration files anywhere, but either the configuration must have the `method` property set or the configuration file must be inside a directory representing the method (e.g. `stubs/get/sub/endpoint.js`). Then start the server:

``` bash
dyson [dir]
```

This starts the services configured in `[dir]` at [localhost:3000](http://localhost:3000).

You can also provide an alternative port number by just adding it as a second argument (e.g. `dyson path/ 8181`).

### Demo

For a demo project, see [webpro/dyson-demo](https://github.com/webpro/dyson-demo). This demo is also [running at nodejitsu](http://dyson.nodejitsu.com).

## Project Configuration

Optionally, you can put a `dyson.json` file next to the configuration folders (inside `[dir]`). It enables to configure some behavior of dyson:

``` javascript
{
	"multiRequest": ",",
	"proxy": true,
	"proxyHost": "http://dyson.jit.su",
	"proxyPort": 8080,
	"proxyDelay": [200, 800]
}
```

* Setting `multiRequest` to `false` disables the [combined requests](#combined-requests) feature.
* Setting `bodyParserJsonLimit` or `bodyParserUrlencodedLimit` to `1mb` increases the limit to 1mb from the bodyParser's default of 100kb.
* By default, the `proxy` is set to `false`

## Development & run tests

``` bash
git clone git@github.com:webpro/dyson.git
cd dyson
npm install
npm test
```

## Articles about dyson

* [Stubbing Network Calls (Api) Using Dyson for Emberjs Apps](http://nepalonrails.com/blog/2014/03/stubbing-network-calls-api-using-dyson-for-emberjs-apps/)
* [Our Ember.js Toolchain](http://nebulab.it/blog/our-ember-js-toolchain)
* [Dyson, construye un servidor de pruebas que devuelva fake JSON para simular una API](http://www.genbetadev.com/herramientas/dyson-construye-un-servidor-de-pruebas-que-devuelva-fake-json-para-simular-una-api)
* [Mockear la capa back con Dyson](http://www.adictosaltrabajo.com/tutoriales/tutoriales.php?pagina=DysonFakeJSON)

## License

[MIT](http://webpro.mit-license.org)
