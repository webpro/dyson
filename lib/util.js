module.exports.logger = options => {
  /* eslint-disable no-console */
  const isQuiet = options.quiet !== false && process.env.NODE_ENV !== 'test';
  return {
    log: (...args) => !isQuiet && console.log(...args),
    err: (...args) => !isQuiet && console.error(...args)
  };
};
