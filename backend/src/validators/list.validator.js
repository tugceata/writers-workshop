const Joi = require('joi');

// Books listeleme
const bookListSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(50),
  sort: Joi.string().valid('created_at', 'updated_at', 'title').default('updated_at'),
  order: Joi.string().valid('asc', 'desc').default('desc'),
  status: Joi.string().valid('draft', 'completed').optional(),
  search: Joi.string().max(100).allow('').optional(),
});

// Reading-log listeleme
const readingLogListSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(50),
  sort: Joi.string().valid('created_at', 'finished_date', 'rating', 'title').default('created_at'),
  order: Joi.string().valid('asc', 'desc').default('desc'),
  min_rating: Joi.number().integer().min(1).max(5).optional(),
  search: Joi.string().max(100).allow('').optional(),
});

module.exports = { bookListSchema, readingLogListSchema };