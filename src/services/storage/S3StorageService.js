"use strict";

const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const StorageProvider = require("./StorageProvider");
const env = require("../../config/env"); // Assuming this exists to get config

class S3StorageService extends StorageProvider {
  constructor() {
    super();
    // Assuming environment variables are AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET
    this.bucketName = process.env.AWS_S3_BUCKET || "sigmabuilder-media";
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  async uploadFile(fileBuffer, fileName, mimeType) {
    const ext = path.extname(fileName);
    const key = `${uuidv4()}${ext}`; // Generate unique key

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: mimeType,
      // ACL: 'public-read' // Uncomment if bucket policies require this
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
    return `https://${this.bucketName}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${fileKey}`;
  }
}

module.exports = S3StorageService;
