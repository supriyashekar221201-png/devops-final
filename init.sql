CREATE TABLE IF NOT EXISTS books (
    id              SERIAL PRIMARY KEY,
    title           TEXT NOT NULL,
    author          TEXT,
    published_year  INTEGER,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO books (title, author, published_year) VALUES
    ('The Pragmatic Programmer', 'Andrew Hunt', 1999),
    ('Clean Code', 'Robert C. Martin', 2008),
    ('Designing Data-Intensive Applications', 'Martin Kleppmann', 2017)
ON CONFLICT DO NOTHING;