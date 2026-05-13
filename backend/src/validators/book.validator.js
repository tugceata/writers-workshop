const Joi = require('joi');

const bookSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).required()
    .messages({
      'string.empty': 'Başlık boş olamaz',
      'string.max': 'Başlık en fazla 200 karakter olabilir',
      'any.required': 'Başlık zorunludur',
    }),
  genre: Joi.string().trim().max(50).allow('', null),
  description: Joi.string().trim().allow('', null),
  goals: Joi.string().trim().allow('', null),
  status: Joi.string().valid('draft', 'active', 'completed', 'paused')
    .default('draft'),
});

module.exports = { bookSchema };