const { AppError } = require('../utils/httpError');
const { ROLE_PERMISSIONS } = require('../constants/roles');

const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new AppError(403, 'You do not have permission to perform this action.'));
  }

  return next();
};

const authorizePermission = (permission) => (req, res, next) => {
  if (!req.user) {
    return next(new AppError(401, 'Authentication is required.'));
  }

  const userPermissions = ROLE_PERMISSIONS[req.user.role] || [];

  if (!userPermissions.includes(permission)) {
    return next(new AppError(403, 'You do not have permission to perform this action.'));
  }

  return next();
};

module.exports = {
  authorizeRoles,
  authorizePermission
};
