const express = require('express');
const readingLogService = require('../services/readingLog.service');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reading Log
 *   description: Okuma günlüğü (auth gerektirir)
 */

/**
 * @swagger
 * /api/reading-log/stats:
 *   get:
 *     summary: Okuma istatistikleri
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
 * /api/reading-log:
 *   get:
 *     summary: Tüm okumaları listele
 *     tags: [Reading Log]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', async (req, res, next) => {
  try {
    const filters = {};
    if (req.query.rating) filters.rating = parseInt(req.query.rating, 10);
    if (req.query.genre) filters.genre = req.query.genre;
    const entries = await readingLogService.listEntries(req.user.id, filters);
    res.json(entries);
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