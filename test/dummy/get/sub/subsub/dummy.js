module.exports = {
    path: '/dummy-three',
    proxy: false,
    template: {
        id: function(params) {
            return params.id || 1;
        },
        name: 'Dummy three',
        status: 'OK'
    }
};
