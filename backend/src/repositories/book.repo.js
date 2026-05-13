const pool = require('../config/db');

async function findAll() {
  const result = await pool.query(
    'SELECT * FROM books ORDER BY created_at DESC'
  );
  return result.rows;
}

async function findById(id) {
  const result = await pool.query(
    'SELECT * FROM books WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

async function create(book) {
  const { title, genre, description, goals, status } = book;
  const result = await pool.query(
    `INSERT INTO books (title, genre, description, goals, status)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [title, genre, description, goals, status]
  );
  return result.rows[0];
}

async function update(id, book) {
  const { title, genre, description, goals, status } = book;
  const result = await pool.query(
    `UPDATE books
     SET title = $1,
         genre = $2,
         description = $3,
         goals = $4,
         status = $5,
         updated_at = NOW()
     WHERE id = $6
     RETURNING *`,
    [title, genre, description, goals, status, id]
  );
  return result.rows[0] || null;
}

async function remove(id) {
  const result = await pool.query(
    'DELETE FROM books WHERE id = $1 RETURNING id',
    [id]
  );
  return result.rowCount > 0;
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
};