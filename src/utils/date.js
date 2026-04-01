const formatMonthKey = (dateValue) => {
  const date = new Date(dateValue);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const formatWeekKey = (dateValue) => {
  const date = new Date(dateValue);
  const workingDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = workingDate.getUTCDay() || 7;
  workingDate.setUTCDate(workingDate.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(workingDate.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((workingDate - yearStart) / 86400000) + 1) / 7);
  return `${workingDate.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
};

module.exports = {
  formatMonthKey,
  formatWeekKey
};
