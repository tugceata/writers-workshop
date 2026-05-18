const express = require('express');
const authService = require('../services/auth.service');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Kullanıcı kimlik doğrulama
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Yeni kullanıcı kaydı
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, username, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: "kullanici@ornek.com"
 *               username:
 *                 type: string
 *                 example: "tugce"
 *               password:
 *                 type: string
 *                 example: "guclusifre123"
 *     responses:
 *       201:
 *         description: Kullanıcı oluşturuldu, token döner
 *       400:
 *         description: Doğrulama hatası
 *       409:
 *         description: E-posta veya kullanıcı adı zaten var
 */
router.post('/register', async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Kullanıcı girişi
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Giriş başarılı, token döner
 *       401:
 *         description: E-posta veya şifre hatalı
 */
router.post('/login', async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Mevcut kullanıcı bilgisi
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Kullanıcı bilgisi
 *       401:
 *         description: Token gerekli
 */
router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/auth/me:
 *   patch:
 *     summary: Kullanıcı ismini güncelle
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/me', authMiddleware, async (req, res, next) => {
  try {
    const user = await authService.updateUsername(req.user.id, req.body.username);
    res.json(user);
  } catch (err) {
    next(err);
  }
});

module.exports = router;