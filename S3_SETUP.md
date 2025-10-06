# S3 Configuration Setup Guide

## Overview

This project has been configured with complete AWS S3 service, including file upload, download, delete, and presigned URL generation functionality.

## Environment Variables Setup

Add the following environment variables to your `.env` file:

```env
# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
S3_BUCKET_NAME=your_bucket_name

# Optional S3 Configuration (for local development or custom S3-compatible services)
# S3_ENDPOINT=http://localhost:9000
# S3_FORCE_PATH_STYLE=true
# S3_SSL_ENABLED=false
```

## Features

### 1. File Upload
- Support direct file upload to S3
- Auto-generate unique file keys
- Support custom metadata

### 2. File Download
- Download files from S3
- Return Base64 encoded file content

### 3. Presigned URLs
- Generate upload presigned URLs
- Generate download presigned URLs
- Configurable expiration time

### 4. File Management
- Check if file exists
- List files
- Delete files

## API Endpoints

### File Upload
```
POST /files/upload
Content-Type: multipart/form-data

Body:
- file: File to upload
- key: (Optional) Custom file key
```

### File Download
```
GET /files/download/:key
```

### Presigned Upload URL
```
GET /files/presigned-upload/:key
Body:
- contentType: (Optional) File type, defaults to application/octet-stream
```

### Presigned Download URL
```
GET /files/presigned-download/:key
```

### List Files
```
GET /files/list
Body:
- prefix: (Optional) File prefix filter
- maxKeys: (Optional) Maximum number of results
```

### Check File Exists
```
GET /files/exists/:key
```

### Delete File
```
DELETE /files/:key
```

## Usage Examples

### 1. Inject S3Service in your service

```typescript
import { Injectable } from '@nestjs/common';
import { S3Service } from '../infra/external/s3.service';

@Injectable()
export class YourService {
  constructor(private readonly s3Service: S3Service) {}

  async uploadFile(file: Buffer, filename: string) {
    return await this.s3Service.upload({
      key: `uploads/${Date.now()}-${filename}`,
      body: file,
      contentType: 'image/jpeg',
    });
  }
}
```

### 2. Generate Presigned URLs

```typescript
// Generate upload URL
const uploadUrl = await this.s3Service.getPresignedUploadUrl(
  'uploads/my-file.jpg',
  'image/jpeg',
  3600 // 1 hour expiration
);

// Generate download URL
const downloadUrl = await this.s3Service.getPresignedDownloadUrl(
  'uploads/my-file.jpg',
  3600 // 1 hour expiration
);
```

## Local Development

If you're using a local S3-compatible service (like MinIO), set the following environment variables:

```env
S3_ENDPOINT=http://localhost:9000
S3_FORCE_PATH_STYLE=true
S3_SSL_ENABLED=false
```

## Security Considerations

1. Ensure AWS credentials are stored securely
2. Set appropriate S3 bucket policies
3. Set reasonable expiration times when using presigned URLs
4. Regularly rotate AWS credentials

## Error Handling

All S3 operations include complete error handling and logging. Common errors include:

- Invalid credentials
- Bucket does not exist
- File not found
- Insufficient permissions

## Monitoring and Logging

S3Service includes detailed logging, including:
- Operation success/failure logs
- File size and type information
- Error details

You can monitor S3 operations by checking these logs in your application logs.