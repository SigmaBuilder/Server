'use strict';

const pagesService = require('./pages.service');

const { getPaginationParams, formatPaginatedResponse } = require('../../../../../utils/pagination');

const getPages = async (req, res, next) => {
  try {
    const { siteId } = req.params;
    const { page, limit, search } = getPaginationParams(req);
    const { data, total } = await pagesService.getPages(siteId, { page, limit, search });
    res.json({ success: true, data: formatPaginatedResponse(data, total, page, limit) });
  } catch (error) {
    next(error);
  }
};

const getPageById = async (req, res, next) => {
  try {
    const { siteId, pageId } = req.params;
    const page = await pagesService.getPageById(siteId, pageId);
    if (!page) {
      return res.status(404).json({ success: false, error: 'Page not found' });
    }
    res.json({ success: true, data: page });
  } catch (error) {
    next(error);
  }
};

const createPage = async (req, res, next) => {
  try {
    const { siteId } = req.params;
    const page = await pagesService.createPage(siteId, req.body);
    res.status(201).json({ success: true, data: page });
  } catch (error) {
    next(error);
  }
};

const updatePage = async (req, res, next) => {
  try {
    const { siteId, pageId } = req.params;
    const page = await pagesService.updatePage(siteId, pageId, req.body);
    if (!page) {
      return res.status(404).json({ success: false, error: 'Page not found' });
    }
    res.json({ success: true, data: page });
  } catch (error) {
    next(error);
  }
};

const setHomePage = async (req, res, next) => {
  try {
    const { siteId, pageId } = req.params;
    const page = await pagesService.setHomePage(siteId, pageId);
    if (!page) {
      return res.status(404).json({ success: false, error: 'Page not found' });
    }
    res.json({ success: true, data: page });
  } catch (error) {
    next(error);
  }
};

const deletePage = async (req, res, next) => {
  try {
    const { siteId, pageId } = req.params;
    const deleted = await pagesService.deletePage(siteId, pageId);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Page not found' });
    }
    res.status(204).send();
  } catch (error) {
    if (error.message === 'HOME_PAGE_DELETION') {
      return res.status(400).json({ success: false, error: 'Cannot delete the home page. Set another page as home first.' });
    }
    next(error);
  }
};

module.exports = {
  getPages,
  getPageById,
  createPage,
  updatePage,
  setHomePage,
  deletePage
};
