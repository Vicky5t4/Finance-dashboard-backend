const { resetDatabase, DATA_FILE } = require('../store/database');

resetDatabase()
  .then(() => {
    console.log(`Database reset successfully at ${DATA_FILE}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to reset database.', error);
    process.exit(1);
  });
