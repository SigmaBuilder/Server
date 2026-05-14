'use strict';

const express = require('express');
const multer = require('multer');
// We need to adjust imports since the file moved deeper
const S3StorageService = require('../../../../services/storage/S3StorageService');
const MediaService = require('../../../../services/media/media.service');
const authorize = require('../../../../middlewares/authorize');

// mergeParams: true allows access to req.params from the parent router (e.g. req.params.projectId)
const router = express.Router({ mergeParams: true });
const upload = multer({ storage: multer.memoryStorage() }); // Store in memory before uploading to S3

const storageService = new S3StorageService(); 
const mediaService = new MediaService(storageService);

// ---------------- FOLDERS ----------------

router.get('/folders', authorize('project:read'), async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { parentId, siteId } = req.query;

    let folders = [];
    if (siteId) {
       const rootFolder = await mediaService.ensureSiteRootFolder(projectId, siteId);
       folders = await mediaService.getFolders(projectId, rootFolder.id);
       return res.json({ rootFolder, folders });
    }

    folders = await mediaService.getFolders(projectId, parentId);
    res.json(folders);
  } catch (error) {
    next(error);
  }
});

router.post('/folders', authorize('project:update'), async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { name, parentId } = req.body;
    
    if (!name) return res.status(400).json({ error: 'name is required' });
    
    const folder = await mediaService.createFolder(projectId, name, parentId);
    res.status(201).json(folder);
  } catch (error) {
    next(error);
  }
});

router.put('/folders/:id', authorize('project:update'), async (req, res, next) => {
  try {
    const { name, parentId } = req.body;
    const folder = await mediaService.updateFolder(req.params.id, { name, parent_id: parentId });
    res.json(folder);
  } catch (error) {
    next(error);
  }
});

router.delete('/folders/:id', authorize('project:update'), async (req, res, next) => {
  try {
    await mediaService.deleteFolder(req.params.id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

// ---------------- ASSETS ----------------

router.get('/assets', authorize('project:read'), async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { folderId, search } = req.query;
    
    const assets = await mediaService.getAssets(projectId, folderId, search);
    res.json(assets);
  } catch (error) {
    next(error);
  }
});

router.post('/assets/upload', authorize('project:update'), upload.single('file'), async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { folderId } = req.body;
    
    if (!req.file) return res.status(400).json({ error: 'File is required' });

    const asset = await mediaService.uploadAsset(projectId, folderId, req.file);
    res.status(201).json(asset);
  } catch (error) {
    next(error);
  }
});

router.put('/assets/:id', authorize('project:update'), async (req, res, next) => {
  try {
    const { folderId } = req.body;
    const asset = await mediaService.updateAsset(req.params.id, { folder_id: folderId });
    res.json(asset);
  } catch (error) {
    next(error);
  }
});

router.delete('/assets/:id', authorize('project:update'), async (req, res, next) => {
  try {
    await mediaService.deleteAsset(req.params.id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
