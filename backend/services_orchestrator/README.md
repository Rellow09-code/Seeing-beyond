# Services Orchestrator

A FastAPI-based microservice that orchestrates multiple services including image analysis, landmark detection, and text-to-speech conversion. The service is deployed on AWS Lambda.

## Features

- Image storage and retrieval
- Image content analysis
- Landmark detection
- Text-to-speech conversion
- Audio streaming
- JSON and audio response formats

## Prerequisites

- Python 3.7+
- FastAPI
- python-multipart
- httpx
- python-dotenv

## Deployment Guide for AWS Lambda

Follow these steps to prepare the deployment package for AWS Lambda:

1. Create a Python directory for dependencies:
```bash
mkdir python
```

2. Install dependencies for Lambda deployment (for Amazon Linux 2 x86_64):
```bash
pip install -r requirements.txt --platform manylinux2014_x86_64 --target ./python --only-binary=:all:
```

3. Copy the main application file to the python directory:
```bash
cp main.py python/
```

4. Create the deployment package (ZIP file):
```powershell
Compress-Archive -Path python/* -DestinationPath app.zip -Force
```

5. Upload the generated `app.zip` to AWS Lambda through the AWS Console.

## Lambda Configuration

1. Runtime: Python 3.9 or higher
2. Handler: main.handler
3. Memory: 256 MB minimum recommended
4. Timeout: 30 seconds recommended
5. Environment variables required:
   - STORAGE_SERVICE_URL
   - IMAGE_SOUND_SERVICE_URL
   - LANDMARK_SERVICE_URL

## API Endpoints

### POST /see-image

Process an image through multiple services.

**Parameters:**
- `file`: Image file (multipart/form-data)
- `format`: Response format ("json" or "audio")

**Response Format (JSON):**
```json
{
    "text_description": "string",
    "landmark_info": {
        "landmark": "string",
        "city": "string",
        "location": {
            "latitude": float,
            "longitude": float
        },
        "score": float
    }
}
```

### Response Formats

The API supports two response formats which can be specified using the `format` query parameter:

1. **JSON Format** (`?format=json`)
   - Returns a JSON object containing the text description and landmark information
   - Example request: `https://orchestra-production.up.railway.app/see-image?format=json`
   - Response type: `application/json`
   - Example response:
   ```json
   {
       "text_description": "I See a group of people walking in a city street. This appears to be Eiffel Tower in Paris",
       "landmark_info": {
           "landmark": "Eiffel Tower",
           "city": "Paris",
           "location": {
               "latitude": 48.8584,
               "longitude": 2.2945
           },
           "score": 0.92
       }
   }
   ```

2. **Audio Format** (`?format=audio`)
   - Returns the description as a WAV audio file
   - Example request: `https://orchestra-production.up.railway.app/see-image?format=audio`
   - Response type: `audio/wav`
   - Content-Disposition: attachment; filename=description.wav
   - The audio file contains the spoken version of the text description

Example usage with different formats:

```bash
# Get JSON response
curl -X POST \
  -F "file=@your_image.jpg" \
  "https://orchestra-production.up.railway.app/see-image?format=json"

# Get Audio response
curl -X POST \
  -F "file=@your_image.jpg" \
  "https://orchestra-production.up.railway.app/see-image?format=audio" \
  --output description.wav
```

```javascript
// JavaScript example for audio format
const formData = new FormData();
formData.append('file', imageFile);

fetch('https://orchestra-production.up.railway.app/see-image?format=audio', {
  method: 'POST',
  body: formData
})
.then(response => response.blob())
.then(blob => {
  const url = window.URL.createObjectURL(blob);
  const audio = new Audio(url);
  audio.play();
});
```

## Deployed API

The API is currently deployed and accessible at:
```
https://orchestra-production.up.railway.app
```

### How to Use the Deployed API

1. **Image Processing Endpoint**
   - URL: `https://orchestra-production.up.railway.app/see-image`
   - Method: POST
   - Content-Type: multipart/form-data

2. **Request Parameters:**
   ```
   - file: Your image file (supported formats: JPG, PNG)
   - format: Response format ("json" or "audio")
   ```

3. **Example Usage with cURL:**
   ```bash
   curl -X POST \
     -F "file=@your_image.jpg" \
     -F "format=json" \
     https://orchestra-production.up.railway.app/see-image
   ```

4. **Example Usage with JavaScript Fetch:**
   ```javascript
   const formData = new FormData();
   formData.append('file', imageFile);
   formData.append('format', 'json');

   fetch('https://orchestra-production.up.railway.app/see-image', {
     method: 'POST',
     body: formData
   })
   .then(response => response.json())
   .then(data => console.log(data));
   ```

Note: Make sure your Lambda function has sufficient permissions to access other AWS services and external APIs.