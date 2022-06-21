const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  password: 'Pwa2h2r!',
  host: 'localhost',
  port: 5432,
  database: 'bank_app'
});

module.exports = { pool };