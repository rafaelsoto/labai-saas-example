const knex = require('knex');
const env = require('./env');

const db = knex({
  client: 'pg',
  connection: {
    host: env.DB_HOST,
    port: env.DB_PORT,
    database: env.DB_NAME,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
  },
  pool: { min: 2, max: 10 },
});

module.exports = db;
