var _ = require('lodash'),
fs = require('fs'),
path = require('path');

// Array of request method configurations
var methodConfigs = [];

var load = function(configDir) {

    var methods = ['get', 'post', 'put', 'delete', 'patch'],
        configs = {},
        methodDir;

    methods.forEach(function(method) {

        methodDir = path.resolve(configDir + '/' + method);

        requireDir(methodDir);
        var requireResults = [];
        // Iterate method configurations and require each
        methodConfigs.map(function(file) {
          var thisRequire = require(file);
          requireResults.push(thisRequire);
        });

        configs[method] = _.flatten(requireResults, true);

    });

  return configs;
};

/**
 * Recursively walk through directories synchronously
 * @param dir
 * @param done
 */
var walkSync = function(dir) {
  var results, list, i = 0, file, stat;
  results = [];
  try {
    list = fs.readdirSync(dir);
    (function next() {
      // Get next file
      file = list[i++];
      // No more files
      if(!file) {
        // Push onto array of results
        results.forEach(function (thisResult) {
          if (methodConfigs.indexOf(thisResult) === -1) {
            methodConfigs.push(thisResult);
          }
        });
      }
      // Create file path
      file = dir + '/' + file;
      stat = fs.statSync(file);
      // If it's a directory, go through this process again
      if(stat && stat.isDirectory()) {
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
  } catch(e) {
    // One of the directory types doesn't exist. Just skip it.
  }
};

/**
 * Walk through each top level directory (get, post, etc), find all subdirectories, require all files
 * @param dir
 * @returns {Array}
 */
var requireDir = function(dir) {
    methodConfigs = [];

    walkSync(dir);
};

module.exports = {
    load: load
};
