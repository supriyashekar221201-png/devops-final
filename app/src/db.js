// db.js — database connection pool
// Creates a single shared connection pool to PostgreSQL.
// All queries in the app go through this pool.

const { Pool } = require('pg');

// Read connection details from environment variables.
// These will be set by Docker Compose / Kubernetes — never hardcoded.
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'booksdb',
  // Pool settings — keeps things responsive without overloading Postgres
  max: 10,                    // max 10 simultaneous connections
  idleTimeoutMillis: 30000,   // close idle connections after 30s
  connectionTimeoutMillis: 5000, // give up if can't connect in 5s
});

// Log connection errors so we can see them in Docker/K8s logs.
pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
});

module.exports = pool;