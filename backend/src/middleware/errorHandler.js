function errorHandler(err, req, res, next) {
  console.error('Hata:', err);

  // Joi doğrulama hatası
  if (err.isJoi) {
    return res.status(400).json({
      error: 'Doğrulama hatası',
      details: err.details.map(d => d.message),
    });
  }

  // Özel HTTP hatası (servis katmanında throw edilen)
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      error: err.message,
    });
  }

  // Genel sunucu hatası
  res.status(500).json({
    error: 'Sunucu hatası',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
}

module.exports = errorHandler;