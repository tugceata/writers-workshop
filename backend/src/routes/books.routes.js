const express = require('express');
const bookService = require('../services/book.service');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Books
 *   description: Kitap yönetimi
 */

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Tüm kitapları listele
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: Kitap listesi
 */
router.get('/', async (req, res, next) => {
  try {
    const books = await bookService.listBooks();
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
    const book = await bookService.getBookById(req.params.id);
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
 *                 example: "Vortex"
 *               genre:
 *                 type: string
 *                 example: "fantasy"
 *               description:
 *                 type: string
 *               goals:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [draft, active, completed, paused]
 *     responses:
 *       201:
 *         description: Kitap oluşturuldu
 *       400:
 *         description: Doğrulama hatası
 */
router.post('/', async (req, res, next) => {
  try {
    const book = await bookService.createBook(req.body);
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
 *               genre:
 *                 type: string
 *               description:
 *                 type: string
 *               goals:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Kitap güncellendi
 *       404:
 *         description: Kitap bulunamadı
 */
router.put('/:id', async (req, res, next) => {
  try {
    const book = await bookService.updateBook(req.params.id, req.body);
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
 *         description: Kitap bulunamadı
 */
router.delete('/:id', async (req, res, next) => {
  try {
    await bookService.deleteBook(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;