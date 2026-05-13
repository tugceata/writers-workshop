const Joi = require('joi');

const chapterSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).required()
    .messages({
      'string.empty': 'Bölüm başlığı boş olamaz',
      'any.required': 'Bölüm başlığı zorunludur',
    }),
  content: Joi.string().allow('', null).default(''),
  chapter_order: Joi.number().integer().min(0).optional(),
  notes: Joi.string().allow('', null),
});

module.exports = { chapterSchema };