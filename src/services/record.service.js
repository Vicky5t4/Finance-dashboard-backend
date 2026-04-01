const { getState, mutateState } = require('../store/database');
const { createId } = require('../utils/id');
const { AppError } = require('../utils/httpError');

const getActiveRecords = async () => {
  const state = await getState();
  return state.records.filter((record) => !record.isDeleted);
};

const filterAndSortRecords = (records, filters) => {
  const filtered = records.filter((record) => {
    if (filters.type && record.type !== filters.type) return false;
    if (filters.category && record.category.toLowerCase() !== filters.category.toLowerCase()) return false;
    if (filters.search) {
      const haystack = `${record.category} ${record.notes}`.toLowerCase();
      if (!haystack.includes(filters.search.toLowerCase())) return false;
    }
    if (filters.fromDate && new Date(record.date) < new Date(filters.fromDate)) return false;
    if (filters.toDate && new Date(record.date) > new Date(filters.toDate)) return false;
    return true;
  });

  filtered.sort((first, second) => {
    const left = first[filters.sortBy];
    const right = second[filters.sortBy];

    if (filters.sortBy === 'amount') {
      return filters.sortOrder === 'asc' ? left - right : right - left;
    }

    const leftValue = String(left).toLowerCase();
    const rightValue = String(right).toLowerCase();

    if (leftValue < rightValue) return filters.sortOrder === 'asc' ? -1 : 1;
    if (leftValue > rightValue) return filters.sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return filtered;
};

const listRecords = async (filters) => {
  const records = await getActiveRecords();
  const filteredRecords = filterAndSortRecords(records, filters);
  const startIndex = (filters.page - 1) * filters.limit;
  const paginatedRecords = filteredRecords.slice(startIndex, startIndex + filters.limit);

  return {
    data: paginatedRecords,
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total: filteredRecords.length,
      totalPages: Math.ceil(filteredRecords.length / filters.limit) || 1
    }
  };
};

const getRecordById = async (recordId) => {
  const state = await getState();
  return state.records.find((record) => record.id === recordId && !record.isDeleted) || null;
};

const createRecord = async (payload, actorId) => {
  const timestamp = new Date().toISOString();
  const newRecord = {
    id: createId(),
    amount: payload.amount,
    type: payload.type,
    category: payload.category,
    date: new Date(payload.date).toISOString().split('T')[0],
    notes: payload.notes || '',
    createdBy: actorId,
    updatedBy: actorId,
    createdAt: timestamp,
    updatedAt: timestamp,
    isDeleted: false
  };

  await mutateState(async (state) => {
    state.records.push(newRecord);
  });

  return newRecord;
};

const updateRecord = async (recordId, payload, actorId) => {
  const existing = await getRecordById(recordId);

  if (!existing) {
    throw new AppError(404, 'Record not found.');
  }

  await mutateState(async (state) => {
    const record = state.records.find((entry) => entry.id === recordId && !entry.isDeleted);
    if (!record) {
      throw new AppError(404, 'Record not found.');
    }

    if (payload.amount !== undefined) record.amount = payload.amount;
    if (payload.type !== undefined) record.type = payload.type;
    if (payload.category !== undefined) record.category = payload.category;
    if (payload.date !== undefined) record.date = new Date(payload.date).toISOString().split('T')[0];
    if (payload.notes !== undefined) record.notes = payload.notes;
    record.updatedBy = actorId;
    record.updatedAt = new Date().toISOString();
  });

  return getRecordById(recordId);
};

const deleteRecord = async (recordId, actorId) => {
  const existing = await getRecordById(recordId);

  if (!existing) {
    throw new AppError(404, 'Record not found.');
  }

  await mutateState(async (state) => {
    const record = state.records.find((entry) => entry.id === recordId && !entry.isDeleted);
    if (!record) {
      throw new AppError(404, 'Record not found.');
    }
    record.isDeleted = true;
    record.updatedBy = actorId;
    record.updatedAt = new Date().toISOString();
  });

  return { deleted: true };
};

module.exports = {
  getActiveRecords,
  listRecords,
  getRecordById,
  createRecord,
  updateRecord,
  deleteRecord
};
