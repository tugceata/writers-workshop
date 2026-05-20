const db = require('../config/db');

async function createRevision({
  chapterId,
  title,
  content,
  wordCount
}) {
  const result = await db.query(
    `
    INSERT INTO chapter_revisions
    (chapter_id, title, content, word_count)
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,
    [chapterId, title, content, wordCount]
  );

  return result.rows[0];
}

async function getRevisionsByChapter(chapterId) {
  const result = await db.query(
    `
    SELECT *
    FROM chapter_revisions
    WHERE chapter_id = $1
    ORDER BY created_at DESC
    `,
    [chapterId]
  );

  return result.rows;
}

async function deleteOldRevisions(chapterId, keep = 15) {
  await db.query(
    `
    DELETE FROM chapter_revisions
    WHERE id IN (
      SELECT id
      FROM chapter_revisions
      WHERE chapter_id = $1
      ORDER BY created_at DESC
      OFFSET $2
    )
    `,
    [chapterId, keep]
  );
}

module.exports = {
  createRevision,
  getRevisionsByChapter,
  deleteOldRevisions,
};