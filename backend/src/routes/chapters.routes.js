const express = require('express');
const chapterService = require('../services/chapter.service');
const revisionService = require('../services/revision.service');

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
    // 2. Body'den createRevision'ı ayır, geri kalanları updateData içine al
    const { createRevision, ...updateData } = req.body;

    // 3. Bölümü Normal Şekilde Güncelle
    const chapter = await chapterService.updateChapter(
      req.params.bookId,
      req.params.id,
      req.user.id,
      updateData // Tüm body yerine, sadece chapter verilerini gönderiyoruz
    );

    // 4. Eğer manuel kaydetme ise Revizyon oluştur!
    if (createRevision) {
      await revisionService.createChapterRevision(
        req.params.id, // chapter id
        req.user.id    // user id
      );
    }

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

// Bölümün revizyon geçmişi
router.get('/:id/revisions', async (req, res, next) => {
  try {
    const revisions = await revisionService.getChapterRevisions(req.params.id, req.user.id);
    res.json(revisions);
  } catch (err) {
    next(err);
  }
});

// Bir sürüme geri dön
router.post('/:id/revisions/:revisionId/restore', async (req, res, next) => {
  try {
    const chapter = await revisionService.restoreRevision(
      req.params.id,
      req.params.revisionId,
      req.user.id
    );
    res.json(chapter);
  } catch (err) {
    next(err);
  }
});

module.exports = router;