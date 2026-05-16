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

  // Kullanıcı adı zaten var mı?
  const existingUsername = await userRepo.findByUsername(value.username);
  if (existingUsername) {
    const err = new Error('Bu kullanıcı adı zaten kullanılıyor');
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

module.exports = {
  generateToken,
  verifyToken,
  register,
  login,
  getCurrentUser,
};