// Archivo de configuración de Knex para desarrollo y producción.
// Usamos el gestor de base de datos PostgreSQL.

'use strict';

// Importamos path y dotenv para usar variables de entorno.
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

/**
 * @type {import('knex').Knex.Config}
 */
const base = {
  client: 'pg', 
  connection: {
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME     || 'sigmabuilder',
    user:     process.env.DB_USER     || 'sigma',
    password: process.env.DB_PASS     || 'sigma_pass',
  },
};

module.exports = {
  development: {
    ...base,
    pool: { min: 2, max: 10 }, 
  },

  production: {
    ...base,
    connection: {
      ...base.connection,
      ssl: { rejectUnauthorized: false }, 
    },
    pool: { min: 2, max: 20 }, 
  },
};
