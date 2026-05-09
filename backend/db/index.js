const { Pool } = require('pg');
require('dotenv').config();

// connect to supabase postgres
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // needed for supabase
});

module.exports = pool;