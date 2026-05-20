const express = require('express');
const readingLogService = require('../services/readingLog.service');

const router = express.Router();

/**
 * @swagger
 * /api/reading-log:
 *   get:
 *     summary: Okuma kayıtlarını listele (sayfalı, filtreli)
 *     tags: [Reading Log]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50 }
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [created_at, finished_date, rating, title] }
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [asc, desc] }
 *       - in: query
 *         name: min_rating
 *         schema: { type: integer, minimum: 1, maximum: 5 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 */
router.get('/', async (req, res, next) => {
  try {
    const result = await readingLogService.listEntries(req.user.id, req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/reading-log/stats:
 *   get:
 *     summary: Okuma istatistikleri (toplam, ortalama, tür dağılımı, puan dağılımı)
 *     tags: [Reading Log]
 *     security:
 *       - bearerAuth: []
 */
router.get('/stats', async (req, res, next) => {
  try {
    const stats = await readingLogService.getStats(req.user.id);
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/reading-log/{id}:
 *   get:
 *     summary: Tek okuma kaydı
 *     tags: [Reading Log]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', async (req, res, next) => {
  try {
    const entry = await readingLogService.getEntryById(req.params.id, req.user.id);
    res.json(entry);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/reading-log:
 *   post:
 *     summary: Yeni okuma kaydı
 *     tags: [Reading Log]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', async (req, res, next) => {
  try {
    const entry = await readingLogService.createEntry(req.user.id, req.body);
    res.status(201).json(entry);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/reading-log/{id}:
 *   put:
 *     summary: Okuma kaydını güncelle
 *     tags: [Reading Log]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', async (req, res, next) => {
  try {
    const entry = await readingLogService.updateEntry(req.params.id, req.user.id, req.body);
    res.json(entry);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/reading-log/{id}:
 *   delete:
 *     summary: Okuma kaydını sil
 *     tags: [Reading Log]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', async (req, res, next) => {
  try {
    await readingLogService.deleteEntry(req.params.id, req.user.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;