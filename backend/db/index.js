const { Pool } = require('pg');
require('dotenv').config();

// force IPv4 to work on Render free tier
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  family: 4
});

module.exports = pool;