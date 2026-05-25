/*
 * Archivo de configuración de la base de datos.
 * Usamos Knex como ORM para interactuar con la base de datos.
 */

'use strict';

const knex   = require('knex');
const env    = require('./env');
const config = require('../../knexfile');

// Determina qué configuración usar según el entorno.
const envKey = env.isProduction ? 'production' : 'development';

// Sobrescribe la conexión desde env.db para tener una única fuente de verdad.
const db = knex({
  ...config[envKey],
  connection: {
    host:     env.db.host,
    port:     env.db.port,
    database: env.db.database,
    user:     env.db.user,
    password: env.db.password,
    ...(env.isProduction && process.env.DB_SSL !== 'false' ? { ssl: { rejectUnauthorized: false } } : {}),
  },
});

module.exports = db;