module.exports = {
  path: '/dummy-two',
  proxy: false,
  template: {
    id: params => {
      return params.id || 1;
    },
    name: 'Dummy two',
    status: 'OK'
  }
};
