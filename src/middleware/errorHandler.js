const { AppError } = require('../utils/httpError');

const errorHandler = (error, req, res, next) => {
  const statusCode = error instanceof AppError ? error.statusCode : 500;
  const message = error instanceof AppError ? error.message : 'Internal server error.';

  if (!(error instanceof AppError)) {
    console.error(error);
  }

  res.status(statusCode).json({
    success: false,
    message,
    details: error instanceof AppError ? error.details : null,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
};

module.exports = {
  errorHandler
};
