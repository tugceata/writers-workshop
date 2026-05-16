const express = require('express');
const bookService = require('../services/book.service');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Books
 *   description: Kitap yönetimi (auth gerektirir)
 */

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Kullanıcının kitaplarını listele
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Kitap listesi
 *       401:
 *         description: Giriş gerekli
 */
router.get('/', async (req, res, next) => {
  try {
    const books = await bookService.listBooks(req.user.id);
    res.json(books);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/books/{id}:
 *   get:
 *     summary: Tek kitap detayı
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Kitap bulundu
 *       404:
 *         description: Kitap bulunamadı
 */
router.get('/:id', async (req, res, next) => {
  try {
    const book = await bookService.getBookById(req.params.id, req.user.id);
    res.json(book);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/books:
 *   post:
 *     summary: Yeni kitap oluştur
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               goals: { type: string }
 *               status: { type: string, enum: [draft, completed] }
 *               tag_ids:
 *                 type: array
 *                 items: { type: integer }
 *     responses:
 *       201:
 *         description: Oluşturuldu
 */
router.post('/', async (req, res, next) => {
  try {
    const book = await bookService.createBook(req.user.id, req.body);
    res.status(201).json(book);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/books/{id}:
 *   put:
 *     summary: Kitabı güncelle
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', async (req, res, next) => {
  try {
    const book = await bookService.updateBook(req.params.id, req.user.id, req.body);
    res.json(book);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/books/{id}:
 *   delete:
 *     summary: Kitabı sil
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', async (req, res, next) => {
  try {
    await bookService.deleteBook(req.params.id, req.user.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;