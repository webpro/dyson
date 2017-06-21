/* eslint-disable no-console */
const dyson = require('./dyson'),
  response = require('./response'),
  pkg = require('../package.json'),
  _ = require('lodash'),
  fs = require('fs'),
  path = require('path'),
  watchr = require('watchr'),
  clearRequire = require('clear-require');

let isStarting, dysonApp;

const execute = options => {
  if(options.length) {
    const watchIndex = options.indexOf('--watch');
    const watch = watchIndex > -1;
    if(watch) {
      options.splice(watchIndex, 1);
    }

    const [ dir, port ] = options;

    const opts = _.defaults(readOptions(dir), {
      port: port || 3000,
      configDir: dir,
      proxy: false,
      multiRequest: ',',
      quiet: false,
      watch: watch
    });

    opts.configDir = path.resolve(opts.configDir);

    if(watch) {
      watchr.open(opts.configDir, function() {
        startDyson(opts);
      });
    }

    startDyson(opts);
  } else {
    showHelp();
  }
};

const startDyson = opts => {
  if(isStarting) {
    return;
  }

  isStarting = true;

  if(dysonApp) {
    console.info('Restarting Dyson...');
    let server = dysonApp.get('dyson_server');
    server.destroy();
    dysonApp = null;

    clearRequire.match(new RegExp('^' + _.escapeRegExp(opts.configDir)));
    response.clearCache();
  }

  fs.stat(opts.configDir, (error, stats) => {
    if(!error && stats.isDirectory()) {
      dysonApp = dyson.bootstrap(opts);
      const watchingInfo = (opts.watch ? ' (watching)' : '');
      console.info(`Dyson listening at port: ${opts.port}${watchingInfo}`);
    } else {
      console.error(`Directory does not exist: ${opts.configDir}`);
    }

    isStarting = false;
  });
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
