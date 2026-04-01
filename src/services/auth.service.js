const { getUserByEmail, sanitizeUser } = require('./user.service');
const { comparePassword } = require('../utils/password');
const { signToken } = require('../utils/jwt');
const { USER_STATUS } = require('../constants/roles');
const { AppError } = require('../utils/httpError');

const loginUser = async ({ email, password }) => {
  const user = await getUserByEmail(email);

  if (!user) {
    throw new AppError(401, 'Invalid email or password.');
  }

  if (user.status !== USER_STATUS.ACTIVE) {
    throw new AppError(403, 'This user account is inactive.');
  }

  const isPasswordValid = await comparePassword(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new AppError(401, 'Invalid email or password.');
  }

  const token = signToken({
    userId: user.id,
    role: user.role,
    email: user.email
  });

  return {
    token,
    user: sanitizeUser(user)
  };
};

module.exports = {
  loginUser
};
