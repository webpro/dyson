const _ = require('lodash');

const delay = (req, res, next) => {
    const delay = res.locals.config.delay;
    if(typeof delay === 'number') {
        _.delay(next, delay);
    } else if(_.isArray(delay)) {
        _.delay(next, _.random.apply(null, delay));
    } else {
        next();
    }
};

module.exports = delay;
