var g = require('dyson-generators');

module.exports = {
    path: '/dummy/:id?',
    template: {
        id: function(params) {
            return params.id || 1;
        },
        name: g.name,
        status: 'OK'
    }
};
