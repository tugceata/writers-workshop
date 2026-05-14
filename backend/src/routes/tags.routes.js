const express = require('express');
const tagService = require('../services/tag.service');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tags
 *   description: Etiket yönetimi
 */

/**
 * @swagger
 * /api/tags:
 *   get:
 *     summary: Tüm etiketleri listele
 *     tags: [Tags]
 *     responses:
 *       200:
 *         description: Etiket listesi
 */
router.get('/', async (req, res, next) => {
  try {
    const tags = await tagService.listTags();
    res.json(tags);
  } catch (err) {
    next(err);
  }
});

module.exports = router;