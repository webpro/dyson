# dyson

Node server for dynamic, fake JSON.

## Give it to me, now

    npm install -g dyson
    dyson demo
    # Check http://localhost:3000/features

There may be errors coming from gyp/mmmagic (in dyson-image) during installation on Windows. These can be ignored, since a fallback dependency is in place.

## Introduction

Dyson allows you to define endpoints at a `path` and return JSON based on a `template` object.

When developing client-side applications, for data usually either static JSON files are used, or an actual server, backend, datastore, API, you name it. Sometimes static files are too static, and sometimes an actual server is not available, not accessible, or too tedious to setup.

This is where dyson comes in. Get a full fake server for your application up and running in minutes.

Here's a complete service endpoint configuration file:

    var g = require('dyson-generators');

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
    * Responses may depend on request path or parameters (e.g. simulate different login scenarios based on username)
    * Respond with different status code for specific requests (e.g. 404 for `?id=999`)
    * Includes random data generators
* Supports GET, POST, PUT, DELETE (and OPTIONS)
* Supports CORS
* Includes dummy image generator (from any image service)

[![Build Status](https://travis-ci.org/webpro/dyson.png)](https://travis-ci.org/webpro/dyson)

## Configuration

Configure endpoints using simple objects:

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

The `template` object may contain properties of the following types:

* function: the function will be invoked with arguments _(params, query, body)_
* string, boolean, number, array: returned as-is
* object: will be recursively iterated
* promise: if the function is a promise, it will be replaced with the resolving value

## Fake data generators

To use the data generators (e.g. `g.name`), run:

    npm install dyson-generators --save-dev

Or manually include [dyson-generators](http://github.com/webpro/dyson-generators) in package.json:

    "devDependencies": {
        "dyson-generators": "~0.1"
    }

and `npm install` to add it. Please refer to [dyson-generators](http://github.com/webpro/dyson-generators) for usage and examples.

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

## Images

In addition to configured endpoints, dyson registers a [dummy image service](http://github.com/webpro/dyson-image) at `/image`. E.g. requesting `/image/300x200` serves an image with given dimensions.

This service is a proxy to [Dynamic Dummy Image Generator](http://dummyimage.com/) by [Russell Heimlich](http://twitter.com/kingkool68).

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
    * used as middleware in Express
    * must set `res.body` and call `next()` to render response
* `render:function`
    * the default function to render the response (basically `res.send(200, res.body);`)
    * used as middleware in Express

## Containers

The response data can be stored anywhere in the response in a `container` object. Functions in the `container` object are invoked with arguments _(params, query, data)_:

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

And an example response:

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

### Installation

    npm install -g dyson

Local installation is unsupported.

### Quick demo

Run `dyson demo` to play around and serve some demo JSON responses at these endpoints:

    http://localhost:3000/employee/1
    http://localhost:3000/users
    http://localhost:3000/features

### Project

In any project you can generate some dummy templates to get started:

    dyson init [dir]

This script copies dummy config objects in the `[dir]/get`, `[dir]/post`, `[dir]/put`, `[dir]/delete` subdirs. These folders are scanned for configuration files when dyson is started:

    dyson [dir]

This starts the services configured in `[dir]` at `http://localhost:3000`.

### Note

Your configuration files are just regular Node modules. Dyson is installed globally as a server; when started it reads those configuration modules local to your project.
So if you need any module in your configuration, then you should add them to your project (`package.json`), and `require()` them in configuration files (e.g. [dyson-generators](#fake-data-generators)).

## Development & run tests

    git clone git@github.com:webpro/dyson.git
    cd dyson
    npm install
    npm test
