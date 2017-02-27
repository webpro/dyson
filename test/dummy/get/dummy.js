const g = require('dyson-generators');

module.exports = {
  path: '/dummy/:id?',
  template: {
    id: params => {
      return params.id || 1;
    },
    name: g.name,
    status: 'OK'
  }
};
