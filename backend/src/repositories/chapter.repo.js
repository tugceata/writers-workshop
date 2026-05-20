const pool = require('../config/db');

async function findByBookId(bookId) {
  const result = await pool.query(
    `SELECT * FROM chapters
     WHERE book_id = $1
     ORDER BY chapter_order ASC`,
    [bookId]
  );
  return result.rows;
}

async function findById(id) {
  const result = await pool.query(
    `SELECT chapters.*, books.user_id
     FROM chapters
     JOIN books ON chapters.book_id = books.id
     WHERE chapters.id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

async function getMaxOrder(bookId) {
  const result = await pool.query(
    `SELECT COALESCE(MAX(chapter_order), 0) AS max_order
     FROM chapters
     WHERE book_id = $1`,
    [bookId]
  );
  return result.rows[0].max_order;
}

async function create(chapter) {
  const { book_id, title, content, chapter_order, notes, word_count } = chapter;
  const result = await pool.query(
    `INSERT INTO chapters (book_id, title, content, chapter_order, notes, word_count)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [book_id, title, content, chapter_order, notes, word_count]
  );
  return result.rows[0];
}

async function update(id, chapter) {
  const { title, content, chapter_order, notes, word_count } = chapter;
  const result = await pool.query(
    `UPDATE chapters
     SET title = $1,
         content = $2,
         chapter_order = $3,
         notes = $4,
         word_count = $5,
         updated_at = NOW()
     WHERE id = $6
     RETURNING *`,
    [title, content, chapter_order, notes, word_count, id]
  );
  return result.rows[0] || null;
}

async function remove(id) {
  const result = await pool.query(
    'DELETE FROM chapters WHERE id = $1 RETURNING id',
    [id]
  );
  return result.rowCount > 0;
}

module.exports = {
  findByBookId,
  findById,
  getMaxOrder,
  create,
  update,
  remove,
};