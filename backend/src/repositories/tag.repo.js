const pool = require('../config/db');

async function findAll() {
  const result = await pool.query('SELECT * FROM tags ORDER BY name ASC');
  return result.rows;
}

async function findByIds(ids) {
  if (!ids || ids.length === 0) return [];
  const result = await pool.query(
    'SELECT * FROM tags WHERE id = ANY($1::int[])',
    [ids]
  );
  return result.rows;
}

async function findByBookId(bookId) {
  const result = await pool.query(
    `SELECT t.* FROM tags t
     JOIN book_tags bt ON bt.tag_id = t.id
     WHERE bt.book_id = $1
     ORDER BY t.name ASC`,
    [bookId]
  );
  return result.rows;
}

async function setBookTags(bookId, tagIds) {
  // Önce eski bağları sil
  await pool.query('DELETE FROM book_tags WHERE book_id = $1', [bookId]);
  // Yeni bağları ekle
  if (tagIds && tagIds.length > 0) {
    const values = tagIds.map((_, i) => `($1, $${i + 2})`).join(', ');
    await pool.query(
      `INSERT INTO book_tags (book_id, tag_id) VALUES ${values}`,
      [bookId, ...tagIds]
    );
  }
}

module.exports = {
  findAll,
  findByIds,
  findByBookId,
  setBookTags,
};