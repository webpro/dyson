module.exports = {
  path: '/dummy-three',
  proxy: false,
  template: {
    id: params => {
      return params.id || 1;
    },
    name: 'Dummy three',
    dummy: 'OK'
  }
};
