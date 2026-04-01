const { AppError } = require('../utils/httpError');

const notFoundHandler = (req, res, next) => {
  next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

module.exports = {
  notFoundHandler
};
