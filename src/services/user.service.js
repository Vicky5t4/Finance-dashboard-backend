const { getState, mutateState } = require('../store/database');
const { createId } = require('../utils/id');
const { hashPassword } = require('../utils/password');
const { USER_STATUS } = require('../constants/roles');
const { AppError } = require('../utils/httpError');

const sanitizeUser = (user) => {
  if (!user) return null;
  const { passwordHash, ...safeUser } = user;
  return safeUser;
};

const listUsers = async () => {
  const state = await getState();
  return state.users.map(sanitizeUser);
};

const getUserById = async (id) => {
  const state = await getState();
  return state.users.find((user) => user.id === id) || null;
};

const getUserByEmail = async (email) => {
  const state = await getState();
  return state.users.find((user) => user.email.toLowerCase() === String(email).toLowerCase()) || null;
};

const createUser = async (payload) => {
  const existingUser = await getUserByEmail(payload.email);

  if (existingUser) {
    throw new AppError(409, 'A user with this email already exists.');
  }

  const timestamp = new Date().toISOString();
  const newUser = {
    id: createId(),
    name: payload.name,
    email: payload.email.toLowerCase(),
    passwordHash: await hashPassword(payload.password),
    role: payload.role,
    status: payload.status || USER_STATUS.ACTIVE,
    createdAt: timestamp,
    updatedAt: timestamp
  };

  await mutateState(async (state) => {
    state.users.push(newUser);
  });

  return sanitizeUser(newUser);
};

const updateUser = async (userId, payload, actorId) => {
  const state = await getState();
  const user = state.users.find((entry) => entry.id === userId);

  if (!user) {
    throw new AppError(404, 'User not found.');
  }

  if (payload.email) {
    const conflict = state.users.find(
      (entry) => entry.id !== userId && entry.email.toLowerCase() === payload.email.toLowerCase()
    );

    if (conflict) {
      throw new AppError(409, 'Another user already uses this email.');
    }
  }

  await mutateState(async (currentState) => {
    const target = currentState.users.find((entry) => entry.id === userId);
    if (!target) {
      throw new AppError(404, 'User not found.');
    }

    if (payload.name !== undefined) target.name = payload.name;
    if (payload.email !== undefined) target.email = payload.email.toLowerCase();
    if (payload.role !== undefined) target.role = payload.role;
    if (payload.status !== undefined) target.status = payload.status;
    if (payload.password !== undefined) target.passwordHash = await hashPassword(payload.password);
    target.updatedAt = new Date().toISOString();
    target.updatedBy = actorId;
  });

  return sanitizeUser(await getUserById(userId));
};

const deleteUser = async (userId, actorId) => {
  const user = await getUserById(userId);

  if (!user) {
    throw new AppError(404, 'User not found.');
  }

  if (user.id === actorId) {
    throw new AppError(400, 'You cannot delete your own account.');
  }

  await mutateState(async (state) => {
    const index = state.users.findIndex((entry) => entry.id === userId);
    if (index === -1) {
      throw new AppError(404, 'User not found.');
    }
    state.users.splice(index, 1);
  });

  return { deleted: true };
};

module.exports = {
  sanitizeUser,
  listUsers,
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser
};
