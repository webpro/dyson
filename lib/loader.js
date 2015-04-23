var _ = require('lodash'),
fs = require('fs'),
path = require('path');

// Array to hold complete results for each require type
var completeResults;

var load = function(configDir) {

  var methods = ['get', 'post', 'put', 'delete', 'patch'],
  configs = {},
  methodDir;

  /**
   * Iterate each method and collect the definition objects
   */
  methods.forEach(function(method) {

    var requireResults = [];

    methodDir = path.resolve(configDir + '/' + method);

    requireDir(methodDir);

    // Require files after they're completely gathered in requireDir()
    completeResults.map(function(file) {
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
var walkSync = function(dir, done) {
  var results, list, i = 0, file, stat;
  results = [];
  try {
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
  } catch (e) {
    // One of the directory types doesn't exist. Just skip it.
  }
};

/**
 * Walk through each top level directory (get, post, etc), find all subdirectories, require all files
 * @param dir
 * @returns {Array}
 */
var requireDir = function(dir) {

  // Recursively walk through all subdirectories and create collection of necessary files
  walkSync(dir, function (err, results) {
    completeResults = results;
  });
};

module.exports = {
  load: load
};
