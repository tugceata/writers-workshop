const bookRepo = require('../repositories/book.repo');
const tagService = require('./tag.service');
const tagRepo = require('../repositories/tag.repo');
const { bookSchema } = require('../validators/book.validator');

async function listBooks() {
  const books = await bookRepo.findAll();
  // Her kitap için tag'leri getir
  for (const book of books) {
    book.tags = await tagRepo.findByBookId(book.id);
  }
  return books;
}

async function getBookById(id) {
  const book = await bookRepo.findById(id);
  if (!book) {
    const err = new Error('Kitap bulunamadı');
    err.statusCode = 404;
    throw err;
  }
  book.tags = await tagRepo.findByBookId(book.id);
  return book;
}

async function createBook(data) {
  const { tag_ids, ...bookData } = data;

  const { value, error } = bookSchema.validate(bookData);
  if (error) throw error;

  const book = await bookRepo.create(value);

  if (tag_ids !== undefined) {
    await tagService.setTagsForBook(book.id, tag_ids);
  }

  book.tags = await tagRepo.findByBookId(book.id);
  return book;
}

async function updateBook(id, data) {
  await getBookById(id);

  const { tag_ids, ...bookData } = data;

  const { value, error } = bookSchema.validate(bookData);
  if (error) throw error;

  const updated = await bookRepo.update(id, value);

  if (tag_ids !== undefined) {
    await tagService.setTagsForBook(id, tag_ids);
  }

  updated.tags = await tagRepo.findByBookId(id);
  return updated;
}

async function deleteBook(id) {
  const deleted = await bookRepo.remove(id);
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