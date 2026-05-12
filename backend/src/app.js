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

// Route'lar buraya gelecek

// 404 yakalayıcı
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint bulunamadı' });
});

// Hata yakalayıcı
app.use(errorHandler);

module.exports = app;