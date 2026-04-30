/* Archivo que maneja la autorización. */

'use strict';

const permissionsService = require('../services/permissions.service');
const AppError = require('../utils/AppError');
const HTTP_STATUS = require('../constants/httpStatus');

/**
 * Obtiene el ID del proyecto de la solicitud.
 * Orden de prioridad: req.params.projectId → req.body.projectId → req.query.projectId
 *
 * @param {import('express').Request} req
 * @returns {string|null}
 */
const resolveProjectId = (req) =>
  req.params.projectId ?? req.body?.projectId ?? req.query?.projectId ?? null;

/**
 * Middleware de autorización que requiere TODOS los permisos listados.
 *
 * @param {string|string[]} requiredPermissions
 * @returns {import('express').RequestHandler}
 */
const authorize = (requiredPermissions) => {
  const actions = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];

  return async (req, _res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) return next(new AppError('Unauthenticated', HTTP_STATUS.UNAUTHORIZED));

      const projectId = resolveProjectId(req);
      if (!projectId) return next(new AppError('Project context required', HTTP_STATUS.BAD_REQUEST));

      const hasAll = await permissionsService.userHasAllPermissions(userId, projectId, actions);
      if (!hasAll) return next(new AppError('Forbidden: insufficient permissions', HTTP_STATUS.FORBIDDEN));

      next();
    } catch (err) {
      next(err);
    }
  };
};

/**
 * Middleware de autorización que requiere AL MENOS UN permiso de los listados.
 *
 * @param {string[]} requiredPermissions
 * @returns {import('express').RequestHandler}
 */
authorize.any = (requiredPermissions) => {
  const actions = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];

  return async (req, _res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) return next(new AppError('Unauthenticated', HTTP_STATUS.UNAUTHORIZED));

      const projectId = resolveProjectId(req);
      if (!projectId) return next(new AppError('Project context required', HTTP_STATUS.BAD_REQUEST));

      const hasAny = await permissionsService.userHasAnyPermission(userId, projectId, actions);
      if (!hasAny) return next(new AppError('Forbidden: insufficient permissions', HTTP_STATUS.FORBIDDEN));

      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = authorize;