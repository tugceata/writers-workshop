const pool = require('../config/db');

async function findAllByUser(userId) {
  const result = await pool.query(
    'SELECT * FROM books WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
}

async function findByIdAndUser(id, userId) {
  const result = await pool.query(
    'SELECT * FROM books WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  return result.rows[0] || null;
}

async function create(book) {
  const { user_id, title, description, goals, status } = book;
  const result = await pool.query(
    `INSERT INTO books (user_id, title, description, goals, status)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [user_id, title, description, goals, status]
  );
  return result.rows[0];
}

async function update(id, userId, book) {
  const { title, description, goals, status } = book;
  const result = await pool.query(
    `UPDATE books
     SET title = $1,
         description = $2,
         goals = $3,
         status = $4,
         updated_at = NOW()
     WHERE id = $5 AND user_id = $6
     RETURNING *`,
    [title, description, goals, status, id, userId]
  );
  return result.rows[0] || null;
}

async function remove(id, userId) {
  const result = await pool.query(
    'DELETE FROM books WHERE id = $1 AND user_id = $2 RETURNING id',
    [id, userId]
  );
  return result.rowCount > 0;
}

module.exports = {
  findAllByUser,
  findByIdAndUser,
  create,
  update,
  remove,
};