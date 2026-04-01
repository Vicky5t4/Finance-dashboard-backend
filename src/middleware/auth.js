const { verifyToken } = require('../utils/jwt');
const { getUserById, sanitizeUser } = require('../services/user.service');
const { USER_STATUS } = require('../constants/roles');
const { AppError } = require('../utils/httpError');

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError(401, 'Authorization token is required.'));
  }

  try {
    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    const user = await getUserById(payload.userId);

    if (!user || user.status !== USER_STATUS.ACTIVE) {
      return next(new AppError(401, 'User is not authorized.'));
    }

    req.user = sanitizeUser(user);
    return next();
  } catch (error) {
    return next(new AppError(401, 'Invalid or expired token.'));
  }
};

module.exports = {
  authenticate
};
