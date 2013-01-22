module.exports = {
    path: '/login',
    template: {
        username: function(params, query, body) {
            return body.username;
        },
        password: function(params, query, body) {
            return body.password === 'password1';
        }
    }
};
