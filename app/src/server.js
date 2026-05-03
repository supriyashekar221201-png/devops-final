// server.js — the Express app with CRUD endpoints
// Endpoints:
//   GET    /health        -> liveness/readiness check for Kubernetes
//   GET    /books         -> list all books
//   GET    /books/:id     -> fetch one book by id
//   POST   /books         -> create a new book
//   PUT    /books/:id     -> update an existing book
//   DELETE /books/:id     -> delete a book

const express = require('express');
const pool = require('./db');

const app = express();
app.use(express.json()); // parse JSON request bodies automatically

const PORT = parseInt(process.env.PORT || '3000', 10);

// ---------- Health check ----------
// Kubernetes hits this endpoint to decide if the pod is alive and ready.
// We also check the database is reachable — if Postgres is down, we're not ready.
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'ok' });
  } catch (err) {
    res.status(503).json({ status: 'unhealthy', error: err.message });
  }
});

// ---------- READ: list all books ----------
app.get('/books', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM books ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('GET /books failed:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ---------- READ: one book ----------
app.get('/books/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM books WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('GET /books/:id failed:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ---------- CREATE ----------
app.post('/books', async (req, res) => {
  try {
    const { title, author, published_year } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'title is required' });
    }
    const result = await pool.query(
      `INSERT INTO books (title, author, published_year)
       VALUES ($1, $2, $3) RETURNING *`,
      [title, author || null, published_year || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('POST /books failed:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ---------- UPDATE ----------
app.put('/books/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, published_year } = req.body;
    const result = await pool.query(
      `UPDATE books
         SET title = COALESCE($1, title),
             author = COALESCE($2, author),
             published_year = COALESCE($3, published_year)
       WHERE id = $4
       RETURNING *`,
      [title, author, published_year, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('PUT /books/:id failed:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ---------- DELETE ----------
app.delete('/books/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM books WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json({ message: 'Book deleted', book: result.rows[0] });
  } catch (err) {
    console.error('DELETE /books/:id failed:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ---------- Start server ----------
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Books CRUD API listening on port ${PORT}`);
});

// ---------- Graceful shutdown ----------
// When Kubernetes wants to stop the pod, it sends SIGTERM.
// We finish in-flight requests, then close the DB pool, then exit cleanly.
const shutdown = async (signal) => {
  console.log(`Received ${signal}, shutting down gracefully...`);
  server.close(async () => {
    await pool.end();
    console.log('Shutdown complete.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));