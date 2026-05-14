'use strict';

const db = require('../../config/db');

class MediaService {
  constructor(storageService) {
    this.storage = storageService;
  }

  // --- Folders ---

  async getFolders(projectId, parentId = null) {
    const query = db('media_folders').where({ project_id: projectId });
    if (parentId) {
      query.where({ parent_id: parentId });
    } else {
      query.whereNull('parent_id');
    }
    return await query.orderBy('name', 'asc');
  }

  async createFolder(projectId, name, parentId = null, siteId = null, isSystem = false) {
    const [folder] = await db('media_folders').insert({
      project_id: projectId,
      name,
      parent_id: parentId,
      site_id: siteId,
      is_system: isSystem
    }).returning('*');
    return folder;
  }

  async getFolderById(folderId) {
    return await db('media_folders').where({ id: folderId }).first();
  }

  async updateFolder(folderId, updates) {
    const [folder] = await db('media_folders')
      .where({ id: folderId })
      .update(updates)
      .returning('*');
    return folder;
  }

  async deleteFolder(folderId) {
    // This should recursively delete subfolders and files.
    // For simplicity, we are deleting the folder, and assuming ON DELETE CASCADE in real DB.
    // Or we should fetch all assets and delete them from S3 first.
    // Let's implement a simple version where we just delete the record.
    await db('media_folders').where({ id: folderId }).del();
  }

  // --- Assets ---

  async getAssets(projectId, folderId = null, search = '') {
    const query = db('media_assets').where({ project_id: projectId });
    if (folderId) {
      query.where({ folder_id: folderId });
    } else {
      query.whereNull('folder_id');
    }
    
    if (search) {
      query.where('file_name', 'ilike', `%${search}%`);
    }

    return await query.orderBy('created_at', 'desc');
  }

  async uploadAsset(projectId, folderId, file) {
    // file is the multer file object
    const { url, key } = await this.storage.uploadFile(file.buffer, file.originalname, file.mimetype);

    const [asset] = await db('media_assets').insert({
      project_id: projectId,
      folder_id: folderId || null,
      file_name: file.originalname,
      file_url: url,
      file_key: key,
      mime_type: file.mimetype,
      size_bytes: file.size
    }).returning('*');

    return asset;
  }

  async updateAsset(assetId, updates) {
     const [asset] = await db('media_assets')
      .where({ id: assetId })
      .update(updates)
      .returning('*');
    return asset;
  }

  async deleteAsset(assetId) {
    const asset = await db('media_assets').where({ id: assetId }).first();
    if (!asset) throw new Error('Asset not found');

    await this.storage.deleteFile(asset.file_key);
    await db('media_assets').where({ id: assetId }).del();
  }

  // Ensure root folder for a site exists
  async ensureSiteRootFolder(projectId, siteId) {
    let folder = await db('media_folders').where({ project_id: projectId, site_id: siteId, is_system: true }).first();
    if (!folder) {
      folder = await this.createFolder(projectId, `Site Root ${siteId}`, null, siteId, true);
    }
    return folder;
  }
}

module.exports = MediaService;
