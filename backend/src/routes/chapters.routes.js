const express = require('express');
const chapterService = require('../services/chapter.service');

// mergeParams: true → parent router'dan :bookId parametresini alabilmek için
const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * tags:
 *   name: Chapters
 *   description: Kitap bölümleri yönetimi
 */

/**
 * @swagger
 * /api/books/{bookId}/chapters:
 *   get:
 *     summary: Kitabın tüm bölümlerini listele
 *     tags: [Chapters]
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Bölüm listesi
 *       404:
 *         description: Kitap bulunamadı
 */
router.get('/', async (req, res, next) => {
  try {
    const chapters = await chapterService.listChapters(req.params.bookId);
    res.json(chapters);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/books/{bookId}/chapters/{id}:
 *   get:
 *     summary: Tek bölüm detayı
 *     tags: [Chapters]
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Bölüm bulundu
 *       404:
 *         description: Kitap veya bölüm bulunamadı
 */
router.get('/:id', async (req, res, next) => {
  try {
    const chapter = await chapterService.getChapterById(req.params.bookId, req.params.id);
    res.json(chapter);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/books/{bookId}/chapters:
 *   post:
 *     summary: Yeni bölüm oluştur
 *     tags: [Chapters]
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: integer
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
 *                 example: "Ara Durak"
 *               content:
 *                 type: string
 *                 example: "<p>Mira istasyonda...</p>"
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Bölüm oluşturuldu
 *       400:
 *         description: Doğrulama hatası
 *       404:
 *         description: Kitap bulunamadı
 */
router.post('/', async (req, res, next) => {
  try {
    const chapter = await chapterService.createChapter(req.params.bookId, req.body);
    res.status(201).json(chapter);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/books/{bookId}/chapters/{id}:
 *   put:
 *     summary: Bölümü güncelle
 *     tags: [Chapters]
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: integer
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
 *               content:
 *                 type: string
 *               chapter_order:
 *                 type: integer
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Bölüm güncellendi
 *       404:
 *         description: Kitap veya bölüm bulunamadı
 */
router.put('/:id', async (req, res, next) => {
  try {
    const chapter = await chapterService.updateChapter(
      req.params.bookId,
      req.params.id,
      req.body
    );
    res.json(chapter);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/books/{bookId}/chapters/{id}:
 *   delete:
 *     summary: Bölümü sil
 *     tags: [Chapters]
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Silindi
 *       404:
 *         description: Kitap veya bölüm bulunamadı
 */
router.delete('/:id', async (req, res, next) => {
  try {
    await chapterService.deleteChapter(req.params.bookId, req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;