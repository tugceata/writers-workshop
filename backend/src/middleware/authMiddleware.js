const authService = require('../services/auth.service');

/**
 * Her korumalı endpoint'ten önce çalışır.
 * Authorization header'ından token okur, doğrular, req.user'a kullanıcıyı ekler.
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Giriş yapmanız gerekiyor' });
  }

  const token = authHeader.slice(7); // "Bearer " kısmını at
  const payload = authService.verifyToken(token);

  if (!payload) {
    return res.status(401).json({ error: 'Geçersiz veya süresi dolmuş token' });
  }

  req.user = payload; // sonraki middleware'ler ve route'lar req.user kullanır
  next();
}

module.exports = authMiddleware;