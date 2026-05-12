const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Writers Workshop API',
      version: '1.0.0',
      description: 'Yaratıcı Yazarlık ve Kitap Takip Sistemi REST API dokümantasyonu',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Geliştirme sunucusu',
      },
    ],
  },
  apis: ['./src/routes/*.js'], // route dosyalarındaki JSDoc yorumlarını okur
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;