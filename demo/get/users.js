var g = require('../../lib/generators');

var user = {
    path: '/user',
    template: {
        id: g.id,
        user: g.name,
        avatar: g.image({ width: 150, height: 150 }),
        city: g.address.city
    }
};

var users = {
    path: '/users',
    collection: true,
    template: user.template
};

module.exports = [user, users];
