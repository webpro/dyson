var _ = require('lodash'),
    fs = require('fs'),
    path = require('path');

var load = function(configDir) {

    var methods = ['get', 'post', 'put', 'delete', 'patch'],
        configs = {},
        methodConfigs,
        methodDir;

    methods.forEach(function(method) {

        methodDir = path.resolve(configDir + '/' + method);

        methodConfigs = requireDir(methodDir);

        configs[method] = _.flatten(methodConfigs, true);

    });

  return configs;
};

/**
 * Recursively walk through directories synchronously
 * @param dir
 * @param done
 */
var walkSync = function(dir, done) {
  var results, list, i = 0, file, stat;
  results = [];
  list = fs.readdirSync(dir);
  (function next() {
    // Get next file
    file = list[i++];
    // No more files
    if (!file) {
      done(null, results);
      return results;
    }
    // Create file path
    file = dir + '/' + file;
    stat = fs.statSync(file);
    // If it's a directory, go through this process again
    if (stat && stat.isDirectory()) {
      walkSync(file, function(err, res) {
        results = results.concat(res);
        next();
      });
    // If not, just
    } else {
      results.push(file);
      next();
    }
  })();
};

/**
 * Walk through each top level directory (get, post, etc), find all subdirectories, require all files
 * @param dir
 * @returns {Array}
 */
var requireDir = function(dir) {

  var requireResults = [];
  // Recursively walk through all subdirectories and include necessary files
  walkSync(dir, function (err, results) {
    results.map(function (file) {
      requireResults.push(require(file));
    });
  });
  return requireResults;
};

module.exports = {
    load: load
};
