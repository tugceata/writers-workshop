const Joi = require('joi');

const registerSchema = Joi.object({
  email: Joi.string().trim().email().max(150).required()
    .messages({
      'string.email': 'Geçerli bir e-posta adresi giriniz',
      'any.required': 'E-posta zorunludur',
    }),
  username: Joi.string().trim().min(1).max(50).allow('', null)
    .messages({
      'string.max': 'İsim en fazla 50 karakter olabilir',
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

const changePasswordSchema = Joi.object({
  current_password: Joi.string().required()
    .messages({
      'any.required': 'Mevcut şifre zorunludur',
    }),
  new_password: Joi.string().min(6).max(100).required()
    .messages({
      'string.min': 'Yeni şifre en az 6 karakter olmalı',
      'any.required': 'Yeni şifre zorunludur',
    }),
});

module.exports = { registerSchema, loginSchema, changePasswordSchema };