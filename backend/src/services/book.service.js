const bookRepo = require('../repositories/book.repo');
const { bookSchema } = require('../validators/book.validator');

async function listBooks() {
  return bookRepo.findAll();
}

async function getBookById(id) {
  const book = await bookRepo.findById(id);
  if (!book) {
    const err = new Error('Kitap bulunamadı');
    err.statusCode = 404;
    throw err;
  }
  return book;
}

async function createBook(data) {
  const { value, error } = bookSchema.validate(data);
  if (error) throw error;

  return bookRepo.create(value);
}

async function updateBook(id, data) {
  await getBookById(id); // önce var mı diye kontrol

  const { value, error } = bookSchema.validate(data);
  if (error) throw error;

  return bookRepo.update(id, value);
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

// === SAF FONKSİYON (test edilecek) ===
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