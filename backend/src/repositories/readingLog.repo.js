const pool = require('../config/db');

async function findAll({ rating, genre } = {}) {
  let query = 'SELECT * FROM reading_log';
  const params = [];
  const conditions = [];

  if (rating !== undefined) {
    params.push(rating);
    conditions.push(`rating = $${params.length}`);
  }

  if (genre) {
    params.push(genre);
    conditions.push(`genre = $${params.length}`);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY created_at DESC';

  const result = await pool.query(query, params);
  return result.rows;
}

async function findById(id) {
  const result = await pool.query(
    'SELECT * FROM reading_log WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

async function create(entry) {
  const { title, author, genre, rating, review, started_date, finished_date } = entry;
  const result = await pool.query(
    `INSERT INTO reading_log
       (title, author, genre, rating, review, started_date, finished_date)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [title, author, genre, rating, review, started_date, finished_date]
  );
  return result.rows[0];
}

async function update(id, entry) {
  const { title, author, genre, rating, review, started_date, finished_date } = entry;
  const result = await pool.query(
    `UPDATE reading_log
     SET title = $1,
         author = $2,
         genre = $3,
         rating = $4,
         review = $5,
         started_date = $6,
         finished_date = $7,
         updated_at = NOW()
     WHERE id = $8
     RETURNING *`,
    [title, author, genre, rating, review, started_date, finished_date, id]
  );
  return result.rows[0] || null;
}

async function remove(id) {
  const result = await pool.query(
    'DELETE FROM reading_log WHERE id = $1 RETURNING id',
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