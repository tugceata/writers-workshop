const pool = require('../config/db');

async function findAllByUser(userId, options = {}) {
  const {
    page = 1,
    limit = 50,
    sort = 'created_at',
    order = 'desc',
    min_rating,
    search,
  } = options;

  const offset = (page - 1) * limit;
  const params = [userId];
  let whereClause = 'WHERE user_id = $1';
  let paramIdx = 2;

  if (min_rating) {
    whereClause += ` AND rating >= $${paramIdx++}`;
    params.push(min_rating);
  }

  if (search) {
    whereClause += ` AND (title ILIKE $${paramIdx} OR author ILIKE $${paramIdx})`;
    params.push(`%${search}%`);
    paramIdx++;
  }

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM reading_log ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0].count, 10);

  const dataResult = await pool.query(
    `SELECT * FROM reading_log ${whereClause}
     ORDER BY ${sort} ${order.toUpperCase()}
     LIMIT $${paramIdx++} OFFSET $${paramIdx++}`,
    [...params, limit, offset]
  );

  return {
    data: dataResult.rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function findByIdAndUser(id, userId) {
  const result = await pool.query(
    'SELECT * FROM reading_log WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  return result.rows[0] || null;
}

async function create(entry) {
  const { user_id, title, author, genre, rating, review, started_date, finished_date } = entry;
  const result = await pool.query(
    `INSERT INTO reading_log
       (user_id, title, author, genre, rating, review, started_date, finished_date)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [user_id, title, author, genre, rating, review, started_date, finished_date]
  );
  return result.rows[0];
}

async function update(id, userId, entry) {
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
     WHERE id = $8 AND user_id = $9
     RETURNING *`,
    [title, author, genre, rating, review, started_date, finished_date, id, userId]
  );
  return result.rows[0] || null;
}

async function remove(id, userId) {
  const result = await pool.query(
    'DELETE FROM reading_log WHERE id = $1 AND user_id = $2 RETURNING id',
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