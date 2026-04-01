const app = require('./app');
const env = require('./src/config/env');

app.listen(env.port, () => {
  console.log(`Finance Dashboard Backend running on http://localhost:${env.port}`);
});
