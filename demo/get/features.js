var g = require('../../lib/generators'),
    _ = require('lodash');

var feature = {
    path: '/feature/:foo?',
    status: function(req, res) {
        if(req.params.foo === '999') {
            res.send(404, 'Feature not found');
        }
    },
    template: {
        id: g.id,
        cid: function() {
            return 'c' + this.id
        },
        user: g.name,
        time: g.time.time,
        memo: g.lorem.short,
        habitat: {
            zip: g.address.zipUS,
            city: g.address.city,
            country: 'Timbuctoo'
        }
    }
};

var features = {
    path: '/features/:bar?',
    collection: true,
    cache: false,
    size: function() {
        return _.random(5,10);
    },
    template: function() {
        return feature.template
    },
    container: {
        meta: function(params, query, data) {
            return {
                path: this.path,
                size: data.length,
                bar: params.bar,
                query: _.pairs(query).join(';')
            }
        },
        data: {
            here: function(params, query, data) {
                return data;
            }
        }
    }
};

module.exports = [feature, features];
