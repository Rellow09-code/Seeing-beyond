Image & Speech API

A simple Express.js API that provides image captioning and text-to-speech conversion, with interactive Swagger documentation.
________________________________________________________________

🚀 Features

Image Analysis: Generate captions from an image URL.

Text-to-Speech: Convert plain text into WAV audio.

Health Check: Verify server status.



Server will run at:
https://seeing-beyond.vercel.app
________________________________________________________________

📖 API Endpoints
1. Health Check

GET /
Returns a confirmation message if the server is running.
________________________________________________________________

2. Analyze Image

POST /image
Request Body:

{
  "imageLink": "https://example.com/image.jpg"
}


Response:

{
  "imageDescription": "cat sitting on table"
}
________________________________________________________________

3. Text to Speech

POST /speak
Request Body:

{
  "text": "Hello world"
}


Response: WAV audio buffer (Content-Type: audio/wav)