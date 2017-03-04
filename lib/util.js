/* eslint-disable no-console */

const isTest = () => {
  return process.env.NODE_ENV === 'test';
};

const log = function() {
  if(!isTest()) {
    console.log.apply(console, arguments);
  }
};

module.exports = {
  isTest,
  log
};
