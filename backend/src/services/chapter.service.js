const chapterRepo = require('../repositories/chapter.repo');
const bookRepo = require('../repositories/book.repo');
const { chapterSchema } = require('../validators/chapter.validator');

// ═══════════════════════════════════════════════
// SAF FONKSİYONLAR (test edilecek)
// ═══════════════════════════════════════════════

function countWords(htmlContent) {
  if (!htmlContent || typeof htmlContent !== 'string') return 0;
  // HTML tag'lerini temizle
  const text = htmlContent.replace(/<[^>]*>/g, ' ');
  // Birden çok boşluğu tek boşluğa indir, kelimelere böl
  const words = text.trim().split(/\s+/).filter(w => w.length > 0);
  return words.length;
}

function nextChapterOrder(currentMaxOrder) {
  if (typeof currentMaxOrder !== 'number' || currentMaxOrder < 0) return 1;
  return currentMaxOrder + 1;
}

// ═══════════════════════════════════════════════
// SERVİS FONKSİYONLARI
// ═══════════════════════════════════════════════

async function assertBookExists(bookId) {
  const book = await bookRepo.findById(bookId);
  if (!book) {
    const err = new Error('Kitap bulunamadı');
    err.statusCode = 404;
    throw err;
  }
  return book;
}

async function listChapters(bookId) {
  await assertBookExists(bookId);
  return chapterRepo.findByBookId(bookId);
}

async function getChapterById(bookId, chapterId) {
  await assertBookExists(bookId);
  const chapter = await chapterRepo.findById(chapterId);
  if (!chapter || chapter.book_id !== parseInt(bookId, 10)) {
    const err = new Error('Bölüm bulunamadı');
    err.statusCode = 404;
    throw err;
  }
  return chapter;
}

async function createChapter(bookId, data) {
  await assertBookExists(bookId);

  const { value, error } = chapterSchema.validate(data);
  if (error) throw error;

  // Sıradaki order numarasını bul
  const maxOrder = await chapterRepo.getMaxOrder(bookId);
  const order = value.chapter_order ?? nextChapterOrder(maxOrder);

  // Kelime sayısını hesapla
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

async function updateChapter(bookId, chapterId, data) {
  const existing = await getChapterById(bookId, chapterId);

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

async function deleteChapter(bookId, chapterId) {
  await getChapterById(bookId, chapterId); // önce var mı?
  await chapterRepo.remove(chapterId);
  return { deleted: true };
}

module.exports = {
  // Saf fonksiyonlar (test için)
  countWords,
  nextChapterOrder,
  // Servis fonksiyonları
  listChapters,
  getChapterById,
  createChapter,
  updateChapter,
  deleteChapter,
};