const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userRepo = require('../repositories/user.repo');
const { registerSchema, loginSchema } = require('../validators/auth.validator');

const SALT_ROUNDS = 10;

// ═══════════════════════════════════════════════
// SAF FONKSİYONLAR (test edilecek)
// ═══════════════════════════════════════════════

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null;
  }
}

// ═══════════════════════════════════════════════
// SERVİS FONKSİYONLARI
// ═══════════════════════════════════════════════

async function register(data) {
  const { value, error } = registerSchema.validate(data);
  if (error) throw error;

  // E-posta zaten var mı?
  const existingEmail = await userRepo.findByEmail(value.email.toLowerCase());
  if (existingEmail) {
    const err = new Error('Bu e-posta zaten kullanılıyor');
    err.statusCode = 409;
    throw err;
  }

  // Şifreyi hash'le
  const password_hash = await bcrypt.hash(value.password, SALT_ROUNDS);

  // Kullanıcıyı oluştur
  const user = await userRepo.create({
    email: value.email.toLowerCase(),
    username: value.username,
    password_hash,
  });

  user.theme = user.theme || 'rose';

  // Token oluştur ve döndür
  const token = generateToken(user);
  return { user, token };
}

async function login(data) {
  const { value, error } = loginSchema.validate(data);
  if (error) throw error;

  const user = await userRepo.findByEmail(value.email.toLowerCase());
  if (!user) {
    const err = new Error('E-posta veya şifre hatalı');
    err.statusCode = 401;
    throw err;
  }

  const isValid = await bcrypt.compare(value.password, user.password_hash);
  if (!isValid) {
    const err = new Error('E-posta veya şifre hatalı');
    err.statusCode = 401;
    throw err;
  }

  // Şifre hash'ini cevaba koyma
  const safeUser = {
    id: user.id,
    email: user.email,
    username: user.username,
    theme: user.theme || 'rose',
    created_at: user.created_at,
  };

  const token = generateToken(safeUser);
  return { user: safeUser, token };
}

async function getCurrentUser(userId) {
  const user = await userRepo.findById(userId);
  if (!user) {
    const err = new Error('Kullanıcı bulunamadı');
    err.statusCode = 404;
    throw err;
  }
  return user;
}

async function updateUsername(userId, newUsername) {
  // Boş veya null ise null'a çevir
  const username = newUsername && newUsername.trim() !== '' ? newUsername.trim() : null;

  if (username && username.length > 50) {
    const err = new Error('İsim en fazla 50 karakter olabilir');
    err.statusCode = 400;
    throw err;
  }

  const pool = require('../config/db');
  const result = await pool.query(
    `UPDATE users SET username = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id, email, username, theme, created_at, updated_at`,
    [username, userId]
  );

  return result.rows[0];
}

async function changePassword(userId, data) {
  const { changePasswordSchema } = require('../validators/auth.validator');
  const { value, error } = changePasswordSchema.validate(data);
  if (error) throw error;

  // Mevcut kullanıcıyı password_hash ile çek
  const pool = require('../config/db');
  const result = await pool.query(
    'SELECT * FROM users WHERE id = $1',
    [userId]
  );
  const user = result.rows[0];

  if (!user) {
    const err = new Error('Kullanıcı bulunamadı');
    err.statusCode = 404;
    throw err;
  }

  // Eski şifreyi doğrula
  const isValid = await bcrypt.compare(value.current_password, user.password_hash);
  if (!isValid) {
    const err = new Error('Mevcut şifre hatalı');
    err.statusCode = 401;
    throw err;
  }

  // Yeni şifreyi hash'le ve kaydet
  const new_hash = await bcrypt.hash(value.new_password, SALT_ROUNDS);
  await pool.query(
    'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
    [new_hash, userId]
  );

  return { success: true };
}

async function deleteAccount(userId) {
  const pool = require('../config/db');
  // CASCADE sayesinde books, chapters, reading_log otomatik silinir
  const result = await pool.query(
    'DELETE FROM users WHERE id = $1 RETURNING id',
    [userId]
  );
  if (result.rowCount === 0) {
    const err = new Error('Kullanıcı bulunamadı');
    err.statusCode = 404;
    throw err;
  }
  return { deleted: true };
}

async function updateTheme(userId, theme) {
  const allowed = ['rose', 'lavender', 'ocean', 'forest'];
  if (!allowed.includes(theme)) {
    const err = new Error('Geçersiz tema');
    err.statusCode = 400;
    throw err;
  }

  const pool = require('../config/db');
  const result = await pool.query(
    `UPDATE users SET theme = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id, email, username, theme, created_at, updated_at`,
    [theme, userId]
  );

  return result.rows[0];
}

module.exports = {
  generateToken,
  verifyToken,
  register,
  login,
  getCurrentUser,
  updateUsername,
  changePassword,
  deleteAccount,
  updateTheme,
};