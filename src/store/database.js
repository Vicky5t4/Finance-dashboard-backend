const fs = require('fs/promises');
const path = require('path');
const os = require('os');
const { createId } = require('../utils/id');
const { ROLES, USER_STATUS } = require('../constants/roles');
const env = require('../config/env');

let state = null;
let initialized = false;
let writeQueue = Promise.resolve();
let storageMode = 'file';

const resolveDataFile = () => {
  if (env.dataFile) {
    return env.dataFile;
  }

  if (process.env.VERCEL) {
    return path.join(os.tmpdir(), 'finance-dashboard-db.json');
  }

  return path.join(process.cwd(), 'data', 'db.json');
};

const DATA_FILE = resolveDataFile();

const now = () => new Date().toISOString();

const seedUsers = async () => {
  const { hashPassword } = require('../utils/password');
  const currentTime = now();

  return [
    {
      id: createId(),
      name: 'Admin User',
      email: 'admin@finance.local',
      passwordHash: await hashPassword('Admin@123'),
      role: ROLES.ADMIN,
      status: USER_STATUS.ACTIVE,
      createdAt: currentTime,
      updatedAt: currentTime
    },
    {
      id: createId(),
      name: 'Analyst User',
      email: 'analyst@finance.local',
      passwordHash: await hashPassword('Analyst@123'),
      role: ROLES.ANALYST,
      status: USER_STATUS.ACTIVE,
      createdAt: currentTime,
      updatedAt: currentTime
    },
    {
      id: createId(),
      name: 'Viewer User',
      email: 'viewer@finance.local',
      passwordHash: await hashPassword('Viewer@123'),
      role: ROLES.VIEWER,
      status: USER_STATUS.ACTIVE,
      createdAt: currentTime,
      updatedAt: currentTime
    }
  ];
};

const seedRecords = () => {
  const currentTime = now();

  return [
    {
      id: createId(),
      amount: 50000,
      type: 'income',
      category: 'Salary',
      date: '2026-03-01',
      notes: 'Monthly salary credit',
      createdBy: 'system',
      updatedBy: 'system',
      createdAt: currentTime,
      updatedAt: currentTime,
      isDeleted: false
    },
    {
      id: createId(),
      amount: 12000,
      type: 'expense',
      category: 'Rent',
      date: '2026-03-03',
      notes: 'Apartment rent',
      createdBy: 'system',
      updatedBy: 'system',
      createdAt: currentTime,
      updatedAt: currentTime,
      isDeleted: false
    },
    {
      id: createId(),
      amount: 3500,
      type: 'expense',
      category: 'Groceries',
      date: '2026-03-08',
      notes: 'Weekly groceries',
      createdBy: 'system',
      updatedBy: 'system',
      createdAt: currentTime,
      updatedAt: currentTime,
      isDeleted: false
    },
    {
      id: createId(),
      amount: 8000,
      type: 'income',
      category: 'Freelance',
      date: '2026-03-10',
      notes: 'Website project payment',
      createdBy: 'system',
      updatedBy: 'system',
      createdAt: currentTime,
      updatedAt: currentTime,
      isDeleted: false
    },
    {
      id: createId(),
      amount: 2200,
      type: 'expense',
      category: 'Utilities',
      date: '2026-03-15',
      notes: 'Electricity and internet bill',
      createdBy: 'system',
      updatedBy: 'system',
      createdAt: currentTime,
      updatedAt: currentTime,
      isDeleted: false
    }
  ];
};

const buildSeedState = async () => ({
  users: await seedUsers(),
  records: seedRecords(),
  meta: {
    storageMode: 'file',
    createdAt: now(),
    updatedAt: now()
  }
});

const saveState = async () => {
  if (!state) {
    return;
  }

  state.meta.updatedAt = now();
  state.meta.storageMode = storageMode;

  writeQueue = writeQueue.then(async () => {
    try {
      await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
      await fs.writeFile(DATA_FILE, JSON.stringify(state, null, 2), 'utf8');
      storageMode = 'file';
      state.meta.storageMode = storageMode;
    } catch (error) {
      storageMode = 'memory';
      state.meta.storageMode = storageMode;
      console.warn('Warning: could not write database file, falling back to in-memory mode.', error.message);
    }
  });

  return writeQueue;
};

const initializeDatabase = async () => {
  if (initialized && state) {
    return state;
  }

  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    state = JSON.parse(raw);
    if (!state.users || !state.records || !state.meta) {
      throw new Error('Database file is incomplete.');
    }
  } catch (error) {
    state = await buildSeedState();
    await saveState();
  }

  initialized = true;
  return state;
};

const getState = async () => {
  await initializeDatabase();
  return state;
};

const mutateState = async (mutator) => {
  const currentState = await getState();
  const result = await mutator(currentState);
  await saveState();
  return result;
};

const resetDatabase = async () => {
  state = await buildSeedState();
  initialized = true;
  await saveState();
  return state;
};

module.exports = {
  DATA_FILE,
  getState,
  mutateState,
  initializeDatabase,
  resetDatabase
};
