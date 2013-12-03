# dyson

Node server for dynamic, fake JSON.

``` bash
npm install -g dyson
```

Check out some [demo services](http://dyson.jit.su).

## Introduction

Dyson allows you to define endpoints at a `path` and return JSON based on a `template` object:

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
* Supports RESTful applications
* Supports GET, POST, PUT, DELETE (and OPTIONS)
* Supports CORS
* Includes dummy image generator
    * Use any external or local image service (included)
    * Supports base64 encoded image strings

[![Build Status](https://travis-ci.org/webpro/dyson.png)](https://travis-ci.org/webpro/dyson)

## Configuration

Configure endpoints using simple objects:

``` javascript
{
    path: '/user/:id',
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
    cache: true,
    size: function() {
        return _.random(2,10);
    },
    collection: false,
    callback: response.generate,
    render: response.render
};
```

* `cache:true` means that multiple requests to the same path will result in the same response
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

Install the data generators (e.g. `g.name`) in your project to use them:

``` bash
npm install dyson-generators --save-dev
```

Please refer to [dyson-generators](http://github.com/webpro/dyson-generators) for usage and examples.

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

## Status codes

By default, all responses are sent with a status code `200` (and the `Content-Type: application/json` header).

This can be completely overridden with the `status` property, e.g.:

``` javascript
{
    path: '/feature/:foo?',
    status: function(req, res) {
        if(req.params.foo === '999') {
            res.send(404, 'Feature not found');
        }
    }
}
```

Would result in a `404` when requesting `/feature/999`.

## Installation

``` bash
npm install -g dyson
```

Note: You need to install dyson as a global module, but configuration files are local to your project.

### Project

In any project you can generate some dummy templates to get started:

``` bash
dyson init [dir]
```

This script copies dummy config files to `[dir]/get/`, `[dir]/post/`, `[dir]/put/`, and `[dir]/delete/`. These folders are scanned for configuration files when dyson is started:

``` bash
dyson [dir]
```

This starts the services configured in `[dir]` at [localhost:3000](http://localhost:3000).

You can also provide an alternative port number by just adding it as a second argument (e.g. `dyson path/ 8181`).

### Demo

For a demo project, see [webpro/dyson-demo](https://github.com/webpro/dyson-demo). This demo is also [running at nodejitsu](http://dyson.nodejitsu.com).

## Development & run tests

``` bash
git clone git@github.com:webpro/dyson.git
cd dyson
npm install
npm test
```

## License

[MIT](http://webpro.mit-license.org)