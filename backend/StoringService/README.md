# Image Storing Service

This service handles image storage operations using AWS Lambda and S3. It provides endpoints for uploading and deleting images through a RESTful API.

## Service URL
[https://2foftaugkqq73jn3jenhxyaxui0gzxff.lambda-url.eu-north-1.on.aws/](https://2foftaugkqq73jn3jenhxyaxui0gzxff.lambda-url.eu-north-1.on.aws/)

## Features
- Image upload to AWS S3
- Presigned URL generation for secure image access
- Image deletion
- Supports multiple image formats (jpg, jpeg, png, gif, bmp)

## API Endpoints

### Upload Image
- **Endpoint**: `/upload-image`
- **Method**: POST
- **Content-Type**: multipart/form-data
- **Parameters**:
  - `file`: Image file (required)
- **Response**:
  ```json
  {
    "url": "presigned-url-for-access",
    "s3_key": "unique-file-identifier"
  }
  ```
- **Supported Formats**: jpg, jpeg, png, gif, bmp

### Delete Image
- **Endpoint**: `/delete/{file_name}`
- **Method**: DELETE
- **Parameters**:
  - `file_name`: The S3 key of the file to delete (received from upload response)
- **Response**:
  ```json
  {
    "detail": "File '{file_name}' deleted successfully"
  }
  ```

## Error Responses
The API may return the following error responses:

- `400 Bad Request`: Invalid file type or no file uploaded
- `404 Not Found`: File not found when attempting to delete
- `500 Internal Server Error`: S3 operation failures

## Implementation Details
- Built with FastAPI and Mangum for AWS Lambda compatibility
- Uses AWS S3 for storage
- Deployed in AWS Lambda (eu-north-1 region)
- Generates time-limited (1 hour) presigned URLs for secure access

## Example Usage

### Uploading an Image
```bash
curl -X POST \
  https://2foftaugkqq73jn3jenhxyaxui0gzxff.lambda-url.eu-north-1.on.aws/upload-image \
  -F "file=@local-image.jpg"
```

### Deleting an Image
```bash
curl -X DELETE \
  https://2foftaugkqq73jn3jenhxyaxui0gzxff.lambda-url.eu-north-1.on.aws/delete/filename.jpg
```

## Deployment Guide for AWS Lambda

Follow these steps to prepare the deployment package for AWS Lambda:

1. Navigate to the service directory:
```bash
cd StoringService
```

2. Install dependencies for Lambda deployment (choose the appropriate platform):
```bash
# For Amazon Linux 2 (x86_64)
pip install -r requirements.txt --platform manylinux2014_x86_64 --target ./python --only-binary=:all:

# Alternative platforms if needed:
# For Amazon Linux 2 (ARM64)
# pip install -r requirements.txt --platform manylinux2014_aarch64 --target ./python --only-binary=:all:
```

3. Copy the main application file to the python directory:
```bash
cp main.py python/
```

4. Create the deployment package (ZIP file):
```powershell
# Using PowerShell
Compress-Archive -Path * -DestinationPath ..\app.zip -Force
```

5. Upload the generated `app.zip` to AWS Lambda through the AWS Console or CLI.

Note: Make sure your Lambda function has the appropriate IAM roles and permissions set up for accessing the required AWS services (S3, DynamoDB, etc.).