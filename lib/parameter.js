var _ = require('lodash');

module.exports = function(requireParameters, req, res, next) {

    var missingParameters = [];

    if(!_.isEmpty(requireParameters)) {
        _.forEach(requireParameters, function(p) {
            if(_.isEmpty(req.body[p]) && _.isEmpty(req.query[p])) {
                missingParameters.push(p);
            }
        });

        if(missingParameters.length > 0) {
            res.status(400).send({error: 'Required parameters(' + missingParameters.join(',') + ') not found.'});
        }
    }

    next();
};
