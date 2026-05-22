'use strict';

const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const StorageProvider = require('./StorageProvider');
const env = require('../../config/env');

class S3StorageService extends StorageProvider {
  constructor() {
    super();
    this.bucketName = env.aws.s3Bucket;
    
    const clientConfig = {
      region: env.aws.region,
      credentials: {
        accessKeyId: env.aws.accessKeyId,
        secretAccessKey: env.aws.secretAccessKey
      }
    };

    // Si AWS_ENDPOINT está definido, configuramos para usar Supabase Storage u otro proveedor compatible (MinIO, etc.)
    if (env.aws.endpoint) {
      clientConfig.endpoint = env.aws.endpoint;
      clientConfig.forcePathStyle = true; // Crucial para que Supabase reconozca correctamente el bucket en la URL
    }

    this.s3Client = new S3Client(clientConfig);
  }

  async uploadFile(fileBuffer, fileName, mimeType, options = {}) {
    const ext = path.extname(fileName);
    const prefix = options.prefix ? `${options.prefix.replace(/^\/+|\/+$/g, '')}/` : '';
    const key = `${prefix}${uuidv4()}${ext}`; // Generate unique key

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: mimeType,
      // ACL: 'public-read' // Descomentar si el bucket necesita esta regla explícitamente al subir (en Supabase no hace falta si el bucket ya es público)
    });

    await this.s3Client.send(command);

    const url = this.getFileUrl(key);
    return { url, key };
  }

  async deleteFile(fileKey) {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
    });

    await this.s3Client.send(command);
  }

  getFileUrl(fileKey) {
    // Si hemos definido una URL base personalizada en el entorno (ej. para CDN o Supabase)
    if (env.aws.publicUrlBase) {
      // Nos aseguramos de quitar cualquier slash final de la base para evitar un doble //
      const baseUrl = env.aws.publicUrlBase.replace(/\/$/, '');
      return `${baseUrl}/${fileKey}`;
    }

    // Fallback: URL estándar pública de AWS S3
    return `https://${this.bucketName}.s3.${env.aws.region}.amazonaws.com/${fileKey}`;
  }
}

module.exports = S3StorageService;
