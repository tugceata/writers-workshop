const chapterRepo = require('../repositories/chapter.repo');
const revisionRepo = require('../repositories/chapterRevision.repo');

async function createChapterRevision(chapterId, userId) {
  const chapter = await chapterRepo.findById(chapterId);

  if (!chapter) {
    throw new Error('Bölüm bulunamadı');
  }

  // ownership check
  if (chapter.user_id !== userId) {
    throw new Error('Bölüm bulunamadı');
  }

  const revision = await revisionRepo.createRevision({
    chapterId,
    title: chapter.title,
    content: chapter.content,
    wordCount: chapter.word_count
  });

  await revisionRepo.deleteOldRevisions(chapterId, 15);

  return revision;
}

async function getChapterRevisions(chapterId, userId) {
  const chapter = await chapterRepo.findById(chapterId);
  if (!chapter || chapter.user_id !== userId) {
    throw new Error('Bölüm bulunamadı');
  }
  return await revisionRepo.getRevisionsByChapter(chapterId);
}

async function restoreRevision(chapterId, revisionId, userId) {
  const chapter = await chapterRepo.findById(chapterId);
  if (!chapter || chapter.user_id !== userId) {
    throw new Error('Bölüm bulunamadı');
  }

  const revisions = await revisionRepo.getRevisionsByChapter(chapterId);
  const revision = revisions.find(r => r.id === parseInt(revisionId, 10));
  if (!revision) {
    throw new Error('Sürüm bulunamadı');
  }

  // Geri dönmeden önce mevcut hali de revision olarak kaydet (kayıp olmasın)
  await revisionRepo.createRevision({
    chapterId,
    title: chapter.title,
    content: chapter.content,
    wordCount: chapter.word_count,
  });

  const pool = require('../config/db');
  const result = await pool.query(
    `UPDATE chapters SET title = $1, content = $2, word_count = $3, updated_at = NOW()
     WHERE id = $4 RETURNING *`,
    [revision.title, revision.content, revision.word_count, chapterId]
  );

  await revisionRepo.deleteOldRevisions(chapterId, 15);
  return result.rows[0];
}

module.exports = {
  createChapterRevision,
  getChapterRevisions,
  restoreRevision,
};