/* Punto de entrada de la aplicación. */

'use strict';

// 1. Configuración del entorno.
const env          = require('./config/env');

// 2. Importamos los módulos de Express y herramientas de seguridad y control.
const express      = require('express');
const helmet       = require('helmet');
const cors         = require('cors');
const cookieParser = require('cookie-parser');
const logger       = require('./utils/logger');
const v1Router     = require('./api/v1/index');
const notFound     = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Trust proxy (Nginx) in production for correct IP rate-limiting
if (env.isProduction) {
  app.set('trust proxy', 1);
}

// Aplicamos Helmet para asegurar la protección de la API.
app.use(helmet());

// Configuración de CORS
app.use(cors({
  origin: env.cors.origin,  
  credentials: true, 
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Cookie parser
app.use(cookieParser());

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// API routes
app.use('/api/v1', v1Router);

// Error handling
app.use(notFound);
app.use(errorHandler);

app.listen(env.port, () => {
  logger.info(`SigmaBuilder Server running`, { port: env.port, env: env.nodeEnv });
});

module.exports = app;