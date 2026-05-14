'use strict';

class StorageProvider {
  /**
   * Upload a file to storage
   * @param {Buffer} fileBuffer - The file content
   * @param {string} fileName - The original file name
   * @param {string} mimeType - The mime type of the file
   * @returns {Promise<{ url: string, key: string }>}
   */
  async uploadFile(fileBuffer, fileName, mimeType) {
    throw new Error('Method not implemented.');
  }

  /**
   * Delete a file from storage
   * @param {string} fileKey - The storage key of the file
   * @returns {Promise<void>}
   */
  async deleteFile(fileKey) {
    throw new Error('Method not implemented.');
  }

  /**
   * Get public URL of a file
   * @param {string} fileKey - The storage key
   * @returns {string}
   */
  getFileUrl(fileKey) {
    throw new Error('Method not implemented.');
  }
}

module.exports = StorageProvider;
