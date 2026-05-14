const express = require('express');
const readingLogService = require('../services/readingLog.service');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reading Log
 *   description: Okuduğun kitapların kaydı
 */

/**
 * @swagger
 * /api/reading-log/stats:
 *   get:
 *     summary: Okuma istatistikleri (toplam, ortalama puan, türlere göre)
 *     tags: [Reading Log]
 *     responses:
 *       200:
 *         description: İstatistikler
 */
router.get('/stats', async (req, res, next) => {
  try {
    const stats = await readingLogService.getStats();
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
 *     parameters:
 *       - in: query
 *         name: rating
 *         schema:
 *           type: integer
 *         description: Belirli bir puana göre filtrele
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *         description: Belirli bir türe göre filtrele
 *     responses:
 *       200:
 *         description: Okuma listesi
 */
router.get('/', async (req, res, next) => {
  try {
    const filters = {};
    if (req.query.rating) filters.rating = parseInt(req.query.rating, 10);
    if (req.query.genre) filters.genre = req.query.genre;

    const entries = await readingLogService.listEntries(filters);
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
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Okuma kaydı bulundu
 *       404:
 *         description: Okuma kaydı bulunamadı
 */
router.get('/:id', async (req, res, next) => {
  try {
    const entry = await readingLogService.getEntryById(req.params.id);
    res.json(entry);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/reading-log:
 *   post:
 *     summary: Yeni okuma kaydı oluştur
 *     tags: [Reading Log]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Kürk Mantolu Madonna"
 *               author:
 *                 type: string
 *                 example: "Sabahattin Ali"
 *               genre:
 *                 type: string
 *                 example: "roman"
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               review:
 *                 type: string
 *               started_date:
 *                 type: string
 *                 format: date
 *               finished_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Kayıt oluşturuldu
 *       400:
 *         description: Doğrulama hatası
 */
router.post('/', async (req, res, next) => {
  try {
    const entry = await readingLogService.createEntry(req.body);
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
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               genre:
 *                 type: string
 *               rating:
 *                 type: integer
 *               review:
 *                 type: string
 *               started_date:
 *                 type: string
 *                 format: date
 *               finished_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Kayıt güncellendi
 *       404:
 *         description: Kayıt bulunamadı
 */
router.put('/:id', async (req, res, next) => {
  try {
    const entry = await readingLogService.updateEntry(req.params.id, req.body);
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
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Silindi
 *       404:
 *         description: Kayıt bulunamadı
 */
router.delete('/:id', async (req, res, next) => {
  try {
    await readingLogService.deleteEntry(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;