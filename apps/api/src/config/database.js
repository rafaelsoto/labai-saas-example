const knex = require('knex');
const env = require('./env');

const connection = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
  : {
      host: env.DB_HOST,
      port: env.DB_PORT,
      database: env.DB_NAME,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
    };

const db = knex({
  client: 'pg',
  connection,
  pool: { min: 2, max: 10 },
});

module.exports = db;
