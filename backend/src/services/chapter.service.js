const chapterRepo = require('../repositories/chapter.repo');
const bookRepo = require('../repositories/book.repo');
const { chapterSchema } = require('../validators/chapter.validator');

// ═══════════════════════════════════════════════
// SAF FONKSİYONLAR (test edilecek)
// ═══════════════════════════════════════════════

function countWords(htmlContent) {
  if (!htmlContent || typeof htmlContent !== 'string') return 0;
  const text = htmlContent.replace(/<[^>]*>/g, ' ');
  const words = text.trim().split(/\s+/).filter(w => w.length > 0);
  return words.length;
}

function nextChapterOrder(currentMaxOrder) {
  if (typeof currentMaxOrder !== 'number' || currentMaxOrder < 0) return 1;
  return currentMaxOrder + 1;
}

// ═══════════════════════════════════════════════
// YARDIMCI: Kitap bu kullanıcıya mı ait?
// ═══════════════════════════════════════════════

async function assertBookBelongsToUser(bookId, userId) {
  const book = await bookRepo.findByIdAndUser(bookId, userId);
  if (!book) {
    const err = new Error('Kitap bulunamadı');
    err.statusCode = 404;
    throw err;
  }
  return book;
}

// ═══════════════════════════════════════════════
// SERVİS FONKSİYONLARI
// ═══════════════════════════════════════════════

async function listChapters(bookId, userId) {
  await assertBookBelongsToUser(bookId, userId);
  return chapterRepo.findByBookId(bookId);
}

async function getChapterById(bookId, chapterId, userId) {
  await assertBookBelongsToUser(bookId, userId);
  const chapter = await chapterRepo.findById(chapterId);
  if (!chapter || chapter.book_id !== parseInt(bookId, 10)) {
    const err = new Error('Bölüm bulunamadı');
    err.statusCode = 404;
    throw err;
  }
  return chapter;
}

async function createChapter(bookId, userId, data) {
  await assertBookBelongsToUser(bookId, userId);

  const { value, error } = chapterSchema.validate(data);
  if (error) throw error;

  const maxOrder = await chapterRepo.getMaxOrder(bookId);
  const order = value.chapter_order ?? nextChapterOrder(maxOrder);
  const wordCount = countWords(value.content);

  return chapterRepo.create({
    book_id: bookId,
    title: value.title,
    content: value.content || '',
    chapter_order: order,
    notes: value.notes,
    word_count: wordCount,
  });
}

async function updateChapter(bookId, chapterId, userId, data) {
  const existing = await getChapterById(bookId, chapterId, userId);

  const { value, error } = chapterSchema.validate(data);
  if (error) throw error;

  return chapterRepo.update(chapterId, {
    title: value.title,
    content: value.content ?? existing.content,
    chapter_order: value.chapter_order ?? existing.chapter_order,
    notes: value.notes ?? existing.notes,
    word_count: countWords(value.content ?? existing.content),
  });
}

async function deleteChapter(bookId, chapterId, userId) {
  await getChapterById(bookId, chapterId, userId);
  await chapterRepo.remove(chapterId);
  return { deleted: true };
}

module.exports = {
  countWords,
  nextChapterOrder,
  listChapters,
  getChapterById,
  createChapter,
  updateChapter,
  deleteChapter,
};