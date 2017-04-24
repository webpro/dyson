/* eslint-disable no-console */

let quiet = false;

const isTest = () => {
  return process.env.NODE_ENV === 'test';
};

const log = function() {
  if(!isTest() && !quiet) {
    console.log.apply(console, arguments);
  }
};

const setQuiet = isQuiet => {
  quiet = typeof isQuiet === 'boolean' ? isQuiet : true;
};

module.exports = {
  isTest,
  log,
  setQuiet
};
