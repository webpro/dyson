const _ = require('lodash');

module.exports = delay => (req, res, next) => {
  if (typeof delay === 'number') {
    _.delay(next, delay);
  } else if (_.isArray(delay)) {
    _.delay(next, _.random.apply(null, delay));
  } else {
    next();
  }
};
