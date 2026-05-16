const Joi = require('joi');

const registerSchema = Joi.object({
  email: Joi.string().trim().email().max(150).required()
    .messages({
      'string.email': 'Geçerli bir e-posta adresi giriniz',
      'any.required': 'E-posta zorunludur',
    }),
  username: Joi.string().trim().alphanum().min(3).max(50).required()
    .messages({
      'string.alphanum': 'Kullanıcı adı sadece harf ve rakam içerebilir',
      'string.min': 'Kullanıcı adı en az 3 karakter olmalı',
      'any.required': 'Kullanıcı adı zorunludur',
    }),
  password: Joi.string().min(6).max(100).required()
    .messages({
      'string.min': 'Şifre en az 6 karakter olmalı',
      'any.required': 'Şifre zorunludur',
    }),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().email().required()
    .messages({
      'string.email': 'Geçerli bir e-posta adresi giriniz',
      'any.required': 'E-posta zorunludur',
    }),
  password: Joi.string().required()
    .messages({
      'any.required': 'Şifre zorunludur',
    }),
});

module.exports = { registerSchema, loginSchema };