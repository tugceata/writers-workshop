const readingLogRepo = require('../repositories/readingLog.repo');
const { readingLogSchema } = require('../validators/readingLog.validator');

// ═══════════════════════════════════════════════
// SAF FONKSİYONLAR (test edilecek)
// ═══════════════════════════════════════════════

function calculateAverageRating(entries) {
  if (!Array.isArray(entries) || entries.length === 0) return 0;
  const rated = entries.filter(e => typeof e.rating === 'number' && e.rating > 0);
  if (rated.length === 0) return 0;
  const sum = rated.reduce((acc, e) => acc + e.rating, 0);
  return Math.round((sum / rated.length) * 10) / 10;
}

function groupByGenre(entries) {
  if (!Array.isArray(entries)) return {};
  return entries.reduce((acc, entry) => {
    const genre = entry.genre || 'Belirtilmemiş';
    acc[genre] = (acc[genre] || 0) + 1;
    return acc;
  }, {});
}

function groupByRating(entries) {
  if (!Array.isArray(entries)) return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  entries.forEach(entry => {
    if (entry.rating >= 1 && entry.rating <= 5) {
      counts[entry.rating]++;
    }
  });
  return counts;
}

function calculateReadingDays(entry) {
  if (!entry || !entry.started_date || !entry.finished_date) return null;
  const start = new Date(entry.started_date);
  const end = new Date(entry.finished_date);
  const diffMs = end - start;
  if (diffMs < 0) return null;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
}

// ═══════════════════════════════════════════════
// SERVİS FONKSİYONLARI
// ═══════════════════════════════════════════════

async function listEntries(userId, query = {}) {
  const { readingLogListSchema } = require('../validators/list.validator');
  const { value, error } = readingLogListSchema.validate(query);
  if (error) throw error;

  return await readingLogRepo.findAllByUser(userId, value);
}

async function getEntryById(id, userId) {
  const entry = await readingLogRepo.findByIdAndUser(id, userId);
  if (!entry) {
    const err = new Error('Okuma kaydı bulunamadı');
    err.statusCode = 404;
    throw err;
  }
  return entry;
}

async function createEntry(userId, data) {
  const { value, error } = readingLogSchema.validate(data);
  if (error) throw error;
  return readingLogRepo.create({ user_id: userId, ...value });
}

async function updateEntry(id, userId, data) {
  await getEntryById(id, userId);
  const { value, error } = readingLogSchema.validate(data);
  if (error) throw error;
  return readingLogRepo.update(id, userId, value);
}

async function deleteEntry(id, userId) {
  const deleted = await readingLogRepo.remove(id, userId);
  if (!deleted) {
    const err = new Error('Okuma kaydı bulunamadı');
    err.statusCode = 404;
    throw err;
  }
  return { deleted: true };
}

async function getStats(userId) {
  const result = await readingLogRepo.findAllByUser(userId);

  const entries = result.data;

  return {
    total: entries.length,
    averageRating: calculateAverageRating(entries),
    byGenre: groupByGenre(entries),
    byRating: groupByRating(entries),
  };
}

module.exports = {
  calculateAverageRating,
  groupByGenre,
  groupByRating,
  calculateReadingDays,
  listEntries,
  getEntryById,
  createEntry,
  updateEntry,
  deleteEntry,
  getStats,
};