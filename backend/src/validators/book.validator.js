const Joi = require('joi');

const bookSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).required()
    .messages({
      'string.empty': 'Başlık boş olamaz',
      'string.max': 'Başlık en fazla 200 karakter olabilir',
      'any.required': 'Başlık zorunludur',
    }),
  description: Joi.string().trim().max(500).allow('', null)
    .messages({
      'string.max': 'Açıklama en fazla 500 karakter olabilir',
    }),
  goals: Joi.string().trim().allow('', null),
  status: Joi.string().valid('draft', 'completed').default('draft')
    .messages({
      'any.only': 'Durum sadece taslak veya tamamlandı olabilir',
    }),
});

module.exports = { bookSchema };