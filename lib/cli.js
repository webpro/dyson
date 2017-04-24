/* eslint-disable no-console */
const dyson = require('./dyson'),
  pkg = require('../package.json'),
  _ = require('lodash'),
  fs = require('fs'),
  path = require('path');

const execute = options => {

  if(options.length) {

    const [ dir, port ] = options;

    const opts = _.defaults(readOptions(dir), {
      port: port || 3000,
      configDir: dir,
      proxy: false,
      multiRequest: ',',
      quiet: false
    });

    opts.configDir = path.resolve(opts.configDir);

    fs.stat(opts.configDir, (error, stats) => {
      if(!error && stats.isDirectory()) {
        dyson.bootstrap(opts);
        console.info(`Dyson listening at port: ${opts.port}`);
      } else {
        console.error(`Directory does not exist: ${opts.configDir}`);
      }
    });

  } else {
    showHelp();
  }
};

const readOptions = configDir => {
  const source = path.resolve(configDir, 'dyson.json');
  let config = {};

  if(fs.existsSync(source)) {
    const stats = fs.statSync(source);
    if(stats && stats.isFile()) {
      config = require(source);
    }
  }

  return config;
};

const showHelp = () => {
  console.info(`dyson v${pkg.version}`);
  console.info('Usage: dyson <dir> [port]');
};

module.exports = {
  execute
};
