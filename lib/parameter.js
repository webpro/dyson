const _ = require('lodash');

module.exports = (req, res, next) => {
  const { requireParameters } = res.locals.config;
  const { body, query } = req;
  if (!_.isEmpty(requireParameters)) {
    const missingParameters = requireParameters.filter(
      parameter => _.isEmpty(body[parameter]) && _.isEmpty(query[parameter])
    );

    if (!_.isEmpty(missingParameters)) {
      const error = `Required parameters (${missingParameters.join(', ')}) not found.`;
      res.status(400).send({ error });
    }
  }
  next();
};
