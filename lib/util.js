const logger = options => {
  /* eslint-disable no-console */
  const isQuiet = options.quiet !== false;
  return {
    log: (...args) => !isQuiet && console.log(...args),
    err: (...args) => !isQuiet && console.error(...args)
  };
};

module.exports = {
  logger
};
