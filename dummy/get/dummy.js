module.exports = {
    path: '/dummy/:id?',
    proxy: false,
    template: {
        id: function(params) {
            return params.id || 1;
        },
        name: 'Lars',
        status: 'OK'
    }
};
