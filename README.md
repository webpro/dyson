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

## Overview

* Easy configuration, extensive options
* Dynamic responses
    * Base response on request path or parameters (e.g. simulate login scenario's based on username)
    * Respond with different status code (e.g. 404) for specific requests (e.g. 404 for `?id=999`)
    * Includes random data generators
* Supports GET, POST, PUT, DELETE (and OPTIONS)
* Supports CORS

## Configuration

Configuration happens by simple objects. Here's a complete service configuration file:

    module.exports = {
        path: '/user/:id',
        template: {
            id: function(params) {
                return params.id;
            },
            name: generator.name
        }
    }

That's all. A request to `/user/412` would return:

    {
        "id": 412,
        "name": "John"
    }

The `path` string is the usual argument provided to [Express](http://expressjs.com/api.html#app.VERB), as in `app.get(path, callback);`.

The `template` object is a hash of values that behave in the following way:

* function: the function will be invoked
    * with arguments _(params, query)_
    * in context of config instance object (created from template as prototype)
* object: will be recursively iterated
* anything else will be returned as-is (e.g. string, boolean, number, array)

## Generators

Some data generators are included (examples behind):

* `id` - returns `_.uniqueId();`
* `name` - 'John', 'Olivia`
* `address.city` - 'Mexico City', 'Beijing'
* `address.zipUS` - '53142', '71238'
* `address.zipNL` - '4715 FW', '7551 VT'
* `time.byQuarter` - '14:45', '9:00'

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
        callback: handleRequest
    };


* `cache:true` means that multiple requests to the same path will result in the same response
* `size:function` is the number of objects in the collection
* `callback:function`
    * the provided default function is doing the hard work for GET requests (but can be overridden)
    * it is used as middleware in Express
    * must set `res.body` and call `next()` to render response

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

## POST, PUT, DELETE

Configuration objects are just like those for GET, but the `callback` (Express middleware) should be defined.

An example config object for `/login`:

    {
        path: '/login',
        callback: function(req, res, next) {
            res.body = {
                "username": req.body.username,
                "success": req.body.password === 'password1'
            };
            next();
        }
    }

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

    npm install dyson -g
    dyson init [dir]
    dyson [dir] 3000
    # Check http://localhost:3000/dummy

Copies a dummy instance at `dir`, including the `/get`, `/post`, `/put`, `/delete` subdirs, and one dummy config object in each. Dyson scans these folders for configuration files when started.

### Demo

Or run `dyson demo 3000` to play around and serve some demo JSON responses at these endpoints:

    http://localhost:3000/employee/1
    http://localhost:3000/users
    http://localhost:3000/features
