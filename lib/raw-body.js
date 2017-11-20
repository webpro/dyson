module.exports = ({ property = 'rawBody' } = {}) => (req, res, next) => {
  let data = '';
  req.on('data', chunk => {
    data += chunk;
  });
  req.on('end', () => {
    req[property] = data;
  });
  next();
};
