const bookRepo = require('../repositories/book.repo');
const tagService = require('./tag.service');
const tagRepo = require('../repositories/tag.repo');
const { bookSchema } = require('../validators/book.validator');

async function listBooks(userId, query = {}) {
  const { bookListSchema } = require('../validators/list.validator');
  const { value, error } = bookListSchema.validate(query);
  if (error) throw error;

  return await bookRepo.findAllByUser(userId, value);
}

async function getBookById(id, userId) {
  const book = await bookRepo.findByIdAndUser(id, userId);
  if (!book) {
    const err = new Error('Kitap bulunamadı');
    err.statusCode = 404;
    throw err;
  }
  book.tags = await tagRepo.findByBookId(book.id);
  return book;
}

async function createBook(userId, data) {
  const { tag_ids, ...bookData } = data;

  const { value, error } = bookSchema.validate(bookData);
  if (error) throw error;

  const book = await bookRepo.create({ user_id: userId, ...value });

  if (tag_ids !== undefined) {
    await tagService.setTagsForBook(book.id, tag_ids);
  }

  book.tags = await tagRepo.findByBookId(book.id);
  return book;
}

async function updateBook(id, userId, data) {
  await getBookById(id, userId);  // var mı + kullanıcıya ait mi kontrolü

  const { tag_ids, ...bookData } = data;

  const { value, error } = bookSchema.validate(bookData);
  if (error) throw error;

  const updated = await bookRepo.update(id, userId, value);

  if (tag_ids !== undefined) {
    await tagService.setTagsForBook(id, tag_ids);
  }

  updated.tags = await tagRepo.findByBookId(id);
  return updated;
}

async function deleteBook(id, userId) {
  const deleted = await bookRepo.remove(id, userId);
  if (!deleted) {
    const err = new Error('Kitap bulunamadı');
    err.statusCode = 404;
    throw err;
  }
  return { deleted: true };
}

// Saf fonksiyon (test edilecek)
function calculateBookProgress(book, totalChapters, writtenChapters) {
  if (totalChapters === 0) return 0;
  const percentage = Math.round((writtenChapters / totalChapters) * 100);
  return Math.min(100, Math.max(0, percentage));
}

module.exports = {
  listBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  calculateBookProgress,
};