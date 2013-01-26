# dyson

Node server for dynamic, fake JSON.

## Give it to me, now

    npm install -g dyson
    dyson demo
    # Check http://localhost:3000/features

## Introduction

Dyson allows you to define endpoints at a `path` and return JSON based on `template` object.

When developing client-side applications, usually either static JSON dummy files are used, or an actual server, backend, datastore, API, you name it. Sometimes static files are too static, and sometimes an actual server is not available, not accessible, or too tedious to setup.

This is where dyson comes in. Get a full fake server for your application up and running in minutes.

Here's a complete service endpoint configuration file:

    var g = require('../../lib/generators');

    module.exports = {
        path: '/user/:id',
        template: {
            id: function(params) {
                return params.id;
            },
            name: g.name
        }
    }

That's all. A request to `/user/412` would return:

    {
        "id": 412,
        "name": "John"
    }

## Overview

* Easy configuration, extensive options
* Dynamic responses
    * Base response on request path or parameters (e.g. simulate login scenario's based on username)
    * Respond with different status code (e.g. 404) for specific requests (e.g. 404 for `?id=999`)
    * Includes random data generators
* Supports GET, POST, PUT, DELETE (and OPTIONS)
* Supports CORS

[![Build Status](https://travis-ci.org/webpro/dyson.png)](https://travis-ci.org/webpro/dyson)

## Configuration

Configuration of endpoints happens by simple objects:

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

The `path` string is the usual argument provided to [Express](http://expressjs.com/api.html#app.VERB), as in `app.get(path, callback);`.

The `template` object is a hash of values behaving in the following way:

* function: the function will be invoked with arguments _(params, query, body)_
* string, boolean, number, array: returned as-is
* object: will be recursively iterated

## Fake data generators

Some generators are included (examples behind):

* `id` - returns `_.uniqueId();`
* `name` - 'John', 'Olivia`
* `address.city` - 'Mexico City', 'Beijing'
* `address.zipUS` - '53142', '71238'
* `address.zipNL` - '4715 FW', '7551 VT'
* `time.byQuarter` - '14:45', '9:00'
* `image({ width: 300, height: 300, text: '300x300', bgColor: '999', fgColor: '666' })` — base64 encoded string of png

A library like [Faker.js](https://github.com/marak/Faker.js/)  is a great add-on to dyson:

    var Faker = require('./Faker');

    module.exports = {
        path: '/user/:id',
        template: {
            id: function(params) {
                return params.id;
            },
            name: function() {
                return Faker.Name.findName();
            },
            email: function() {
                return Faker.Internet.email();
            }
        }
    }

Feel free to send in pull requests for generic fake data generators, or roll your own custom library of data generators, to suit your specific project needs.

## Collections

Same as examples above, but override the `collection` property:

    {
        path: '/users',
        collection: true,
        template: user.template
    }

This will give a response with an array of users (default array length is random between 2 and 10):

    [
        {
            "id": 412,
            "name": "John"
        },
        {
            "id": 218,
            "name": "Olivia"
        }
    ]

## Defaults

The default values for the configuration objects:

    {
        cache: true,
        size: function() {
            return _.random(2,10);
        },
        collection: false,
        callback: response.generate,
        render: response.render
    };


* `cache:true` means that multiple requests to the same path will result in the same response
* `size:function` is the number of objects in the collection
* `callback:function`
    * the provided default function is doing the hard work (but can be overridden)
    * it is used as middleware in Express
    * must set `res.body` and call `next()` to render response
* `render:function`
    * the default function to render the response (basically `res.send(200, res.body);`)
    * also used as middleware in Express

## Containers

The response data can be wrapped in a `container` object. Functions in the `container` object are invoked with arguments _(params, query, data)_:

    {
        path: '/users',
        template: user.template,
        container: {
            meta: function(params, query, data) {
                userCount: data.length
            },
            data: {
                here: function(params, query, data) {
                    return data;
                }
            }
        }
    }

And an example response:

    {
        "meta": {
            "userCount": 2
        },
        "data": {
            "here": [
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

## Combined requests

Basic support for "combined" requests is available, by means of a comma separated path fragment.

For example, a request to `/user/5,13` will result in an array of the responses from `/user/5` and `/user/13`.

## Status codes

By default, all responses are sent with a status code `200` (and the `Content-Type: application/json` header).

This can be completely overridden with the `status` property, e.g.:

    path: '/feature/:foo?',
    status: function(req, res) {
        if(req.params.foo === '999') {
            res.send(404, 'Feature not found');
        }
    }

Would result in a `404` when requesting `/feature/999`.

## Get started

### Quick demo

    npm install dyson -g

Note: To generate images [node-canvas](https://github.com/LearnBoost/node-canvas) is used. Check out [wiki](https://github.com/LearnBoost/node-canvas/wiki/_pages) to find install guide for your particular system.

Run `dyson demo` to play around and serve some demo JSON responses at these endpoints:

    http://localhost:3000/employee/1
    http://localhost:3000/users
    http://localhost:3000/features

### Global installation

This is the recommended usage.

    npm install -g dyson

### Without global installation

Add dyson to `devDependencies` and some `scripts` to package.json:

    "devDependencies": {
        "dyson": "~0.0.3"
    },
    "scripts": {
        "dyson-init": "node ./node_modules/.bin/dyson init .",
        "dyson": "node ./node_modules/.bin/dyson . 3000"
    }

### Project

In any project you can generate some dummy templates to get started:

    dyson init [dir]

This script copies dummy config objects in the `[dir]/get`, `[dir]/post`, `[dir]/put`, `[dir]/delete` subdirs. These folders are scanned for configuration files when dyson is started:

    dyson [dir]

To expose the services configured in `[dir]` at `http://localhost:3000`.

The equivalents of the previous project commands without dyson globally installed are:

    npm run-script dyson-init
    npm run-script dyson

To use the data generators, dyson needs to be added to the `devDependencies`.

## Development & run tests

    git clone git@github.com:webpro/dyson.git
    cd dyson
    npm install
    npm test
