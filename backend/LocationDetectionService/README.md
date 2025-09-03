# Location Detection Service

A FastAPI-based microservice that detects landmarks in images and provides location information using Google Cloud Vision API and OpenStreetMap's Nominatim service. The service is deployed on AWS Lambda.

## Features

- Landmark detection in images using Google Cloud Vision API
- Reverse geocoding to get city names from coordinates using Nominatim
- RESTful API endpoint for image processing
- Error handling and timeout management
- Rate limiting compliance with Nominatim's terms of service

## Prerequisites

- Python 3.7+
- FastAPI
- python-dotenv
- requests
- Google Cloud Vision API key

## Setup

1. Install dependencies:
```bash
pip install fastapi python-dotenv requests uvicorn
```

2. Create a `.env` file in the service directory with your Google API key:
```
GOOGLE_API_KEY=your_api_key_here
```

## API Endpoints

### GET /detect-landmark

Detects landmarks in an image and returns location information.

**Query Parameters:**
- `image_url` (required): URL of the image to analyze

**Response Format:**
```json
{
    "landmark": "string",
    "city": "string",
    "location": {
        "latitude": float,
        "longitude": float
    },
    "score": float
}
```

**Status Codes:**
- 200: Successful detection
- 404: No landmark detected
- 500: Server error or API request failure

## Error Handling

The service includes comprehensive error handling for:
- Invalid image URLs
- Network timeouts
- API errors
- Missing landmarks
- Geocoding failures

## Rate Limiting

The service respects Nominatim's usage policy by:
- Including a User-Agent header
- Using appropriate timeout values
- Handling rate limit responses

## Example Usage

```python
import requests

response = requests.get(
    "http://localhost:8000/detect-landmark",
    params={"image_url": "https://example.com/image.jpg"}
)
result = response.json()
print(f"Found {result['landmark']} in {result['city']}")
```

## Running the Service

Start the service using uvicorn:
```bash
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.

## Service Deployment

The service is deployed on AWS Lambda. Replace `<YOUR_LAMBDA_URL>` in the examples below with your actual Lambda function URL.

### Example Usage with Lambda

```python
import requests

response = requests.get(
    "<YOUR_LAMBDA_URL>/detect-landmark",
    params={"image_url": "https://example.com/image.jpg"}
)
result = response.json()
print(f"Found {result['landmark']} in {result['city']}")
```

## Deployment Guide for AWS Lambda

Follow these steps to prepare the deployment package for AWS Lambda:

1. Navigate to the service directory:
```bash
cd LocationDetectionService
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

Note: Make sure your Lambda function has the appropriate IAM roles and permissions set up for accessing Google Cloud Vision API and other required services.