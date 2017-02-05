module.exports = ({ property = 'rawBody' } = {}) => {
    return function(req, res, next) {
        let data = '';
        req.on('data', chunk => {
            data += chunk;
        });
        req.on('end', () => {
            req[property] = data;
        });
        next();
    };
};
