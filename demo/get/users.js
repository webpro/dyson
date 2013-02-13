var g = require('dyson-generators');

var user = {
    path: '/user',
    template: {
        id: g.id,
        user: g.name,
        city: g.address.city
    }
};

var users = {
    path: '/users',
    collection: true,
    template: user.template
};

module.exports = [user, users];
