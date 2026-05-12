require('dotenv').config();
const app = require('./src/app');
const pool = require('./src/config/db');

const PORT = process.env.PORT || 3000;

// Veritabanı bağlantısı testi
pool.query('SELECT NOW()', (err) => {
  if (err) {
    console.error('Veritabanı bağlantısı başarısız:', err.message);
    console.log('Yine de sunucu başlatılıyor...');
  }
});

const server = app.listen(PORT, () => {
  console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
  console.log(`API Docs: http://localhost:${PORT}/api-docs`);
});

// Düzgün kapanma
process.on('SIGTERM', () => {
  console.log('SIGTERM alındı, sunucu kapatılıyor...');
  server.close(() => {
    pool.end();
    process.exit(0);
  });
});