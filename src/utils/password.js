const bcrypt = require('bcryptjs');

const hashPassword = async (password) => bcrypt.hash(password, 10);
const comparePassword = async (password, passwordHash) => bcrypt.compare(password, passwordHash);

module.exports = {
  hashPassword,
  comparePassword
};
