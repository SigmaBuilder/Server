// Archivo de configuración de variables de entorno.

'use strict';

// Importamos path y dotenv para usar variables de entorno.
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Definimos las variables de entorno requeridas, ya que si no existen, el servidor no podrá iniciar.
const REQUIRED_VARS = [
  'DB_HOST',
  'DB_NAME',
  'DB_USER',
  'DB_PASS',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
];

// Verificamos que todas las variables requeridas estén definidas.
const missing = REQUIRED_VARS.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`\n[FATAL] Missing required environment variables:\n  ${missing.join('\n  ')}\n`);
  process.exit(1);
}

// Creamos el objeto de configuración con todas las variables.
const env = {
  nodeEnv:      process.env.NODE_ENV || 'development', 
  isProduction: process.env.NODE_ENV === 'production',
  port:         parseInt(process.env.PORT || '3000', 10),
  db: {
    host:     process.env.DB_HOST,
    port:     parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME,
    user:     process.env.DB_USER,
    password: process.env.DB_PASS,
  },
  jwt: {
    accessSecret:    process.env.JWT_ACCESS_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN  || '15m',
    refreshSecret:   process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    max:      parseInt(process.env.RATE_LIMIT_MAX        || '20',     10),
  },
};

module.exports = env;