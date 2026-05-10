const { Pool } = require('pg');
const dns = require('dns');
require('dotenv').config();

// force IPv4 DNS resolution
dns.setDefaultResultOrder('ipv4first');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = pool;