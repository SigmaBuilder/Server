/* Controladores de portfolio_items */

'use strict';

const service = require('./portfolio_items.service');
const { sendSuccess } = require('../../../../../utils/response');
const HTTP_STATUS = require('../../../../../constants/httpStatus');

const getAll = async (req, res, next) => {
  try {
    const data = await service.getAll(req.params.siteId);
    sendSuccess(res, { portfolioItems: data });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const data = await service.getById(req.params.siteId, req.params.id);
    sendSuccess(res, { portfolioItem: data });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const data = await service.create(req.params.siteId, req.body);
    sendSuccess(res, { portfolioItem: data }, HTTP_STATUS.CREATED);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const data = await service.update(req.params.siteId, req.params.id, req.body);
    sendSuccess(res, { portfolioItem: data });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await service.remove(req.params.siteId, req.params.id);
    sendSuccess(res, null, HTTP_STATUS.NO_CONTENT);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};
