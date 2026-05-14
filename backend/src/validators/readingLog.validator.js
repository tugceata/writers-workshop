const Joi = require('joi');

const readingLogSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).required()
    .messages({
      'string.empty': 'Kitap başlığı boş olamaz',
      'any.required': 'Kitap başlığı zorunludur',
    }),
  author: Joi.string().trim().max(150).allow('', null),
  genre: Joi.string().trim().max(50).allow('', null),
  rating: Joi.number().integer().min(1).max(5).allow(null)
    .messages({
      'number.min': 'Puan 1 ile 5 arasında olmalıdır',
      'number.max': 'Puan 1 ile 5 arasında olmalıdır',
    }),
  review: Joi.string().allow('', null),
  started_date: Joi.date().iso().allow(null),
  finished_date: Joi.date().iso().allow(null),
}).custom((value, helpers) => {
  // İş kuralı: bitiş tarihi başlangıçtan önce olamaz
  if (value.started_date && value.finished_date) {
    if (new Date(value.finished_date) < new Date(value.started_date)) {
      return helpers.error('any.invalid', {
        message: 'Bitiş tarihi başlangıç tarihinden önce olamaz',
      });
    }
  }
  return value;
}).messages({
  'any.invalid': 'Bitiş tarihi başlangıç tarihinden önce olamaz',
});

module.exports = { readingLogSchema };