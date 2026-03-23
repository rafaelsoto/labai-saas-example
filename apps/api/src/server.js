const app = require('./app');
const env = require('./config/env');

app.listen(env.PORT, () => {
  console.log(`🚀 API running on http://localhost:${env.PORT}`);
  console.log(`📊 Environment: ${env.NODE_ENV}`);
});
