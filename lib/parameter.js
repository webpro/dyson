const _ = require('lodash');

module.exports = (req, res, next) => {
    const requireParameters = res.locals.config.requireParameters;
    if(!_.isEmpty(requireParameters)) {
        const missingParameters = requireParameters.filter(parameter => {
            return _.isEmpty(req.body[parameter]) && _.isEmpty(req.query[parameter]);
        });

        if(!_.isEmpty(missingParameters)) {
            res.status(400).send({ error: `Required parameters (${missingParameters.join(', ')}) not found.` });
        }
    }
    next();
};
