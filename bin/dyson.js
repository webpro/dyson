#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const pkg = require('../package.json');
const { bootstrap } = require('../lib/dyson');

const [dir, port] = process.argv.slice(2);

const showHelpAndExit = () => {
  console.info(`dyson v${pkg.version}`);
  console.info('Usage: dyson <dir> [port]');
  process.exit(1);
};

if (dir) {
  let localOpts;

  const configPath = path.join(process.cwd(), dir);
  const dirStat = fs.statSync(configPath);

  if (!dirStat || !dirStat.isDirectory()) {
    showHelpAndExit();
  }

  try {
    localOpts = require(path.join(configPath, 'dyson.json'));
  } catch (err) {
    localOpts = {};
  }

  const opts = _.defaults(localOpts, {
    port: port || 3000,
    configDir: dir,
    proxy: false,
    multiRequest: ',',
    quiet: false
  });

  bootstrap(opts);
} else {
  showHelpAndExit();
}
