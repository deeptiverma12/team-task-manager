const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

// parse the url and force IPv4
const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  host: 'db.gsalfggqfuijgwbwuzkn.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'BOqoaJT4k3B9pOUA',
  family: 4
});

module.exports = pool;