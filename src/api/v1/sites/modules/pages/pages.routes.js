'use strict';

const { Router } = require('express');

const controller = require('./pages.controller');

const authorize = require('../../../../../middlewares/authorize');

const router = Router({ mergeParams: true });

router.get('/', authorize("project:read"), controller.getPages);
router.get('/:pageId', authorize("project:read"), controller.getPageById);

router.post('/', authorize("project:update"), controller.createPage);

router.patch('/:pageId', authorize("project:update"), controller.updatePage);
router.patch('/:pageId/set-home', authorize("project:update"), controller.setHomePage);

router.delete('/:pageId', authorize("project:update"), controller.deletePage);

module.exports = router;