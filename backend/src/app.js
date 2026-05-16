const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware'ler
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Swagger dokümantasyonu
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Sağlık kontrolü
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Karşılama
app.get('/', (req, res) => {
  res.json({
    name: 'Writers Workshop API',
    docs: '/api-docs',
    health: '/health',
  });
});

// Route'lar
const authMiddleware = require('./middleware/authMiddleware');

// Auth (giriş gerektirmez)
app.use('/api/auth', require('./routes/auth.routes'));

// Tags (herkes okuyabilir, sadece liste)
app.use('/api/tags', require('./routes/tags.routes'));

// Korumalı route'lar (auth gerekir)
app.use('/api/books', authMiddleware, require('./routes/books.routes'));
app.use('/api/books/:bookId/chapters', authMiddleware, require('./routes/chapters.routes'));
app.use('/api/reading-log', authMiddleware, require('./routes/readingLog.routes'));

// 404 yakalayıcı
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint bulunamadı' });
});

// Hata yakalayıcı
app.use(errorHandler);

module.exports = app;