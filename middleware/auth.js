const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function auth(req, res, next) {
  const token = req.header('x-auth-token');
  if (!token) res.status(401).send('go login');

  try {
    const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).send('invalid token');
  }
};
