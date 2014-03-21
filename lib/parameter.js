var _ = require('lodash');

module.exports = function(req, res, next){
  var config = this,
      missingParameters = [];

  // check if it's need require parameters
  if (!_.isEmpty(config.requireParameters)) {
    _(config.requireParameters).forEach(function(p){
      if (_.isEmpty(req.body[p]) && _.isEmpty(req.query[p])) {
        missingParameters.push(p);
      }
    });

    // check missing parameters
    if (missingParameters.length > 0) {
      res.status(400).send({"error": "Required parameters(" + missingParameters.join(',') + ") not found."});
    }
  }

  next();
};
