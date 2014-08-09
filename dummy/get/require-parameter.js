var g = require('dyson-generators');

module.exports = {
    path: '/requireparams',
    requireParameters: ["client_id"],
    template: {
        id: g.id,
        name: g.name,
        address: {
            city: g.address.city,
            zipUS: g.address.zipUS
        },
        time: g.time.byQuarter,
        lorem: g.lorem.short,
    }
};
