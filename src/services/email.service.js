/* Servicio para envío de correos. */

'use strict';

const { Resend } = require('resend');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
const env = require('../config/env');

const resend = new Resend(env.resend.apiKey);

/**
 * Cache de plantillas compiladas para evitar leer y compilar
 * del disco duro en cada envío.
 */
const templatesCache = {};

/**
 * Lee, compila (o recupera de cache) y ejecuta una plantilla Handlebars.
 * @param {string} templateName - Nombre de la plantilla sin la extensión (ej. 'forgot-password').
 * @param {Object} context - Datos para inyectar en la plantilla.
 * @returns {string} - HTML generado.
 */
const compileTemplate = (templateName, context) => {
  if (!templatesCache[templateName]) {
    const filePath = path.join(__dirname, '../templates/emails', `${templateName}.hbs`);
    const source = fs.readFileSync(filePath, 'utf-8');
    templatesCache[templateName] = handlebars.compile(source);
  }
  return templatesCache[templateName](context);
};

/**
 * Envía un correo utilizando Resend.
 * @param {string} to - Dirección(es) de correo destinatario.
 * @param {string} subject - Asunto del correo.
 * @param {string} templateName - Nombre del archivo de plantilla.
 * @param {Object} context - Datos requeridos por la plantilla.
 * @returns {Promise<Object>} - Resultado del envío.
 */
const sendMail = async (to, subject, templateName, context) => {
  try {
    const html = compileTemplate(templateName, context);
    
    // NOTA: 'onboarding@resend.dev' es el dominio de prueba.
    // Para producción debe configurarse un dominio verificado en Resend.
    const response = await resend.emails.send({
      from: 'SigmaBuilder <no-reply@sigmabuilder.app>',
      to,
      subject,
      html,
    });
    
    if (response.error) {
      throw new Error(response.error.message);
    }
    
    return response.data;
  } catch (err) {
    console.error(`[Email Service] Error enviando correo a ${to}:`, err.message);
    throw err;
  }
};

module.exports = {
  sendMail
};
