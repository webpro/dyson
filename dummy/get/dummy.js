module.exports = {
	path: '/dummy/:id?',
	template: {
		id: function(params) {
            return params.id || 1;
        },
        name: 'Lars',
        status: 'OK'
    }
};
