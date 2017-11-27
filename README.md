# dyson

Node server for dynamic, fake JSON.

## Introduction

Dyson allows you to define JSON endpoints based on a simple `path` + `template` object:

``` javascript
# my-stubs/users.js
module.exports = {
  path: '/users/:userId',
  template: {
    id: params => Number(params.userId),
    name: () => faker.name.findName(),
    email: () => faker.internet.email(),
    status: (params, query) => query.status,
    lorem: true
  }
};
```

``` bash
$ dyson ./my-stubs
$ curl http://localhost:3000/users/1?status=active
```

``` json
{
  "id": 1,
  "name": "Josie Greenfelder",
  "email": "Raoul_Aufderhar@yahoo.com",
  "status": "active",
  "lorem": true
}
```

When developing client-side applications, often either static JSON files, or an actual server, backend, datastore, or API, is used. Sometimes static files are too static, and sometimes an actual server is not available, not accessible, or too tedious to set up.

This is where dyson comes in. Get a full fake server for your application up and running in minutes.

* [Installation notes](#installation)
* [Demo](https://dyson-demo-npzwhgjdor.now.sh)

[![Build Status](https://img.shields.io/travis/webpro/dyson.svg?style=flat)](https://travis-ci.org/webpro/dyson)
[![npm package](https://img.shields.io/npm/v/dyson.svg?style=flat)](https://www.npmjs.com/package/dyson)
[![dependencies](https://img.shields.io/david/webpro/dyson.svg?style=flat)](https://david-dm.org/webpro/dyson)
![npm version](https://img.shields.io/node/v/dyson.svg?style=flat)

## Overview

* Dynamic responses, based on
  * Request path
  * GET/POST parameters
  * Query parameters
  * Cookies
* HTTP Methods: GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS
* Dynamic HTTP status codes
* CORS
* Proxy (e.g. fallback to actual services)
* Delayed responses
* Required parameter validation
* Includes random data generators
* Includes dummy image generator
  * Use any external or local image service (included)
  * Supports base64 encoded image strings

## Endpoint Configuration

Configure endpoints using simple objects:

``` javascript
module.exports = {
  path: '/user/:id',
  method: 'GET',
  template: {
    id: (params, query, body) =>params.id,
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

* A `Function` will be invoked with arguments `(params, query, body, cookies, headers)`.
* Primitives of type `String`, `Boolean`, `Number`, `Array` are returned as-is
* An `Object` will be recursively iterated.
* A `Promise` will be replaced with its resolved value.

Note: the `template` itself can also be a _function_ returning the actual data. The template function itself is also invoked with arguments `(params, query, body, cookies, headers)`.

## Defaults

The default values for the configuration objects:

``` javascript
module.exports = {
  cache: false,
  delay: false,
  proxy: false,
  size: () => _.random(2,10),
  collection: false,
  callback: response.generate,
  render: response.render
};
```

* `cache: true` means that multiple requests to the same path will result in the same response
* `delay: n` will delay the response with `n` milliseconds (or between `[n, m]` milliseconds)
* `proxy: false` means that requests to this file can be skipped and sent to the configured proxy
* `size: fn` is the number of objects in the collection
* `collection: true` will return a collection
* `callback: fn`
  * the provided default function is doing the hard work (can be overridden)
  * used as middleware in Express
  * must set `res.body` and call `next()` to render response
* `render: fn`
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

## Containers

Containers can help if you need to send along some meta data, or wrap the response data in a specific way. Just use the `container` object, and return the `data` where you want it. Functions in the `container` object are invoked with arguments `(params, query, data)`:

``` javascript
module.exports = {
  path: '/users',
  template: user.template,
  container: {
    meta: (params, query, data) => ({
      userCount: data.length
    }),
    data: {
      all: [],
      the: {
        way: {
          here: (params, query, data) => data
        }
      }
    }
  }
}
```

And an example response:

``` json
{
  "meta": {
    "userCount": 2
  },
  "data": {
    "all": [],
    "the": {
      "way": {
        "here": [{
          "id": 412,
          "name": "John"
        }, {
          "id": 218,
          "name": "Olivia"
        }]
      }
    }
  }
}
```

## Combined requests

Basic support for "combined" requests is available, by means of a comma separated path fragment.

For example, a request to `/user/5,13` will result in an array of the responses from `/user/5` and `/user/13`.

The `,` delimiter can be [configured](#project-configuration) (or disabled).

## Status codes

By default, all responses are sent with a status code `200` (and the `Content-Type: application/json` header).

This can be overridden with your own `status` middleware, e.g.:

``` javascript
module.exports = {
  path: '/feature/:foo?',
  status: (req, res, next) => {
    if(req.params.foo === '999') {
      res.status(404);
    }
    next();
  }
}
```

Would result in a `404` when requesting `/feature/999`.

## Images

In addition to configured endpoints, dyson registers a [dummy image service](http://github.com/webpro/dyson-image) at `/image`. E.g. requesting `/image/300x200` serves an image with given dimensions.

This service is a proxy to [Dynamic Dummy Image Generator](http://dummyimage.com/) by [Russell Heimlich](http://twitter.com/kingkool68).

## JSONP

Override the `render` method of the Express middleware in the endpoint definition. In the example below, depending on the existence of the `callback` parameter, either raw JSON response is returned or it is wrapped with the provided callback:

``` javascript
module.exports = {
  render: (req, res) => {
    const callback = req.query.callback;
    if (callback) {
      res.append('Content-Type', 'application/javascript');
      res.send(`${callback}(${JSON.stringify(res.body)});`);
    } else {
      res.send(res.body);
    }
  }
}
```

## HTTPS

If you want to run dyson over SSL you have to provide a (authority-signed or self-signed) certificate into the `options.https` the same way it's required for NodeJS built-in `https` module. Example:

``` javascript
const fs = require('fs');

const app = dyson.createServer({
  configDir: `${__dirname}/dummy`,
  port: 3001,
  https: {
    key: fs.readFileSync(`${__dirname}'/certs/sample.key`),
    crt: fs.readFileSync(`${__dirname}/certs/sample.crt`)
  }
});
```

**Note**: if running SSL on port 443, it will require `sudo` privileges.

## Custom middleware

If you need some custom middleware before or after the endpoints are registered, dyson can be initialized programmatically.
Then you can use the Express server instance (`appBefore` or `appAfter` in the example below) to install middleware before or after the dyson services are registered. An example:

``` javascript
const dyson = require('dyson');
const path = require('path');

const options = {
  configDir: path.join(__dirname, 'services'),
  port: 8765
};

const configs = dyson.getConfigurations(options);
const appBefore = dyson.createServer(options);
const appAfter = dyson.registerServices(appBefore, options, configs);

console.log(`Dyson listening at port ${options.port}`);
```

Dyson configuration can also be installed into any Express server:

``` javascript
const express = require('express');
const dyson = require('./lib/dyson');
const path = require('path');

const options = {
  configDir: path.join(__dirname, 'services')
};

const myApp = express();
const configs = dyson.getConfigurations(options);

dyson.registerServices(myApp, options, configs);

myApp.listen(8765);
```

## Installation

The recommended way to install dyson is to install it locally and put it in your `package.json`:

``` bash
npm install dyson --save-dev
```

Then you can use it from `scripts in `package.json` using e.g. `npm run mocks`:

``` json
{
  "name": "my-package",
  "version": "1.0.0",
  "scripts": {
    "mocks": "dyson mocks/"
  }
}
```

You can also install dyson globally to start it from anywhere:

``` bash
npm install -g dyson
```

### Project

You can put your configuration files anywhere. The HTTP method is based on:

* The `method` property in the configuration itself.
* The folder, or an ancestor folder, containing the configuration is an HTTP method. For example `mocks/post/sub/endpoint.js` will be an endpoint listening to `POST` requests.
* Defaults to `GET`.

``` bash
dyson [dir]
```

This starts the services configured in `[dir]` at [localhost:3000](http://localhost:3000).

You can also provide an alternative port number by just adding it as a second argument (e.g. `dyson path/ 8181`).

### Demo

* For a demo project, see [webpro/dyson-demo](https://github.com/webpro/dyson-demo).
* This demo was also installed with [now.sh](https://zeit.co/now/) to [dyson-demo-npzwhgjdor.now.sh](https://dyson-demo-npzwhgjdor.now.sh).

## Project Configuration

Optionally, you can put a `dyson.json` file next to the configuration folders (inside `[dir]`). It enables to configure some behavior of dyson:

``` json
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

## Watch/auto-restart

If you want to automatically restart dyson when you change your configuration objects, you can add [nodemon](https://nodemon.io) as a `devDependency`. Say your configuration files are in the `./api` folder, you can put this in your `package.json`:

```
"scripts": {
  "mocks": "dyson mocks/",
  "watch": "nodemon --watch mocks --exec dyson mocks"
}
```

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
* [Serve JSONP in Dyson](https://grysz.com/2015/12/01/serve-jsonp-in-dyson/)
* Videos
	* [Dyson - HTTP Service mocking](https://www.youtube.com/watch?v=aoSk5Bak-KM)
	* [How to implement HTTP Mock Services into Webpack - Dyson](https://www.youtube.com/watch?v=tfCQOcz9oi4)

## License

[MIT](http://webpro.mit-license.org)
