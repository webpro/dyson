var _ = require('lodash');

module.exports = function(req, res, next) {

    var config = this,
        missingParameters = [];

    if(!_.isEmpty(config.requireParameters)) {
        _.forEach(config.requireParameters, function(p) {
            if(_.isEmpty(req.body[p]) && _.isEmpty(req.query[p])) {
                missingParameters.push(p);
            }
        });

        if(missingParameters.length > 0) {
            res.status(400).send({"error": "Required parameters(" + missingParameters.join(',') + ") not found."});
        }
    }

    next();
};
