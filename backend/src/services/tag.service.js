const tagRepo = require('../repositories/tag.repo');

// ═══════════════════════════════════════════════
// SAF FONKSİYONLAR (test edilecek)
// ═══════════════════════════════════════════════

function validateTagIds(tagIds, maxCount = 3) {
  if (tagIds === undefined || tagIds === null) return [];
  if (!Array.isArray(tagIds)) {
    const err = new Error('Tag listesi bir dizi olmalıdır');
    err.statusCode = 400;
    throw err;
  }
  // Önce temizle: integer'a çevir, geçersizleri filtrele, tekrarları çıkar
  const cleaned = [...new Set(
    tagIds
      .map(id => parseInt(id, 10))
      .filter(n => Number.isInteger(n) && n > 0)
  )];
  // Sonra sayıyı kontrol et
  if (cleaned.length > maxCount) {
    const err = new Error(`En fazla ${maxCount} tag eklenebilir`);
    err.statusCode = 400;
    throw err;
  }
  return cleaned;
}

// ═══════════════════════════════════════════════
// SERVİS FONKSİYONLARI
// ═══════════════════════════════════════════════

async function listTags() {
  return tagRepo.findAll();
}

async function setTagsForBook(bookId, tagIds) {
  const cleaned = validateTagIds(tagIds);
  if (cleaned.length > 0) {
    const found = await tagRepo.findByIds(cleaned);
    if (found.length !== cleaned.length) {
      const err = new Error('Geçersiz tag id\'leri var');
      err.statusCode = 400;
      throw err;
    }
  }
  await tagRepo.setBookTags(bookId, cleaned);
  return tagRepo.findByBookId(bookId);
}

async function getTagsForBook(bookId) {
  return tagRepo.findByBookId(bookId);
}

module.exports = {
  validateTagIds,
  listTags,
  setTagsForBook,
  getTagsForBook,
};