const { getActiveRecords } = require('./record.service');
const { formatMonthKey, formatWeekKey } = require('../utils/date');

const sumByType = (records, type) => records
  .filter((record) => record.type === type)
  .reduce((sum, record) => sum + record.amount, 0);

const getOverview = async () => {
  const records = await getActiveRecords();
  const totalIncome = sumByType(records, 'income');
  const totalExpenses = sumByType(records, 'expense');

  return {
    totalIncome,
    totalExpenses,
    netBalance: totalIncome - totalExpenses,
    totalRecords: records.length
  };
};

const getCategoryBreakdown = async () => {
  const records = await getActiveRecords();
  const categories = new Map();

  for (const record of records) {
    const key = `${record.type}:${record.category}`;
    const current = categories.get(key) || {
      type: record.type,
      category: record.category,
      totalAmount: 0,
      transactionCount: 0
    };

    current.totalAmount += record.amount;
    current.transactionCount += 1;
    categories.set(key, current);
  }

  return Array.from(categories.values()).sort((a, b) => b.totalAmount - a.totalAmount);
};

const getRecentActivity = async (limit = 5) => {
  const records = await getActiveRecords();
  return records
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, limit);
};

const getTrends = async (interval = 'month') => {
  const records = await getActiveRecords();
  const buckets = new Map();

  for (const record of records) {
    const key = interval === 'week' ? formatWeekKey(record.date) : formatMonthKey(record.date);
    const current = buckets.get(key) || {
      interval: key,
      income: 0,
      expense: 0,
      net: 0
    };

    if (record.type === 'income') {
      current.income += record.amount;
    } else {
      current.expense += record.amount;
    }

    current.net = current.income - current.expense;
    buckets.set(key, current);
  }

  return Array.from(buckets.values()).sort((a, b) => a.interval.localeCompare(b.interval));
};

const getDashboardData = async () => ({
  overview: await getOverview(),
  categoryBreakdown: await getCategoryBreakdown(),
  recentActivity: await getRecentActivity(5),
  monthlyTrends: await getTrends('month')
});

module.exports = {
  getOverview,
  getCategoryBreakdown,
  getRecentActivity,
  getTrends,
  getDashboardData
};
