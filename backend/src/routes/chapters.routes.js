const express = require('express');
const chapterService = require('../services/chapter.service');

const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * tags:
 *   name: Chapters
 *   description: Kitap bölümleri (auth gerektirir)
 */

/**
 * @swagger
 * /api/books/{bookId}/chapters:
 *   get:
 *     summary: Kitabın bölümlerini listele
 *     tags: [Chapters]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', async (req, res, next) => {
  try {
    const chapters = await chapterService.listChapters(req.params.bookId, req.user.id);
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
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', async (req, res, next) => {
  try {
    const chapter = await chapterService.getChapterById(
      req.params.bookId,
      req.params.id,
      req.user.id
    );
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
 *     security:
 *       - bearerAuth: []
 */
router.post('/', async (req, res, next) => {
  try {
    const chapter = await chapterService.createChapter(
      req.params.bookId,
      req.user.id,
      req.body
    );
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
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', async (req, res, next) => {
  try {
    const chapter = await chapterService.updateChapter(
      req.params.bookId,
      req.params.id,
      req.user.id,
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
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', async (req, res, next) => {
  try {
    await chapterService.deleteChapter(
      req.params.bookId,
      req.params.id,
      req.user.id
    );
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;