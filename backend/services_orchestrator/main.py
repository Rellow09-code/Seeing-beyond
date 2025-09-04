from fastapi import FastAPI, UploadFile, File, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from mangum import Mangum
import httpx
import os
from dotenv import load_dotenv
from typing import Optional
from pydantic import BaseModel
import io
import logging
import traceback
import json

# Configure logging for AWS Lambda
logger = logging.getLogger()
logger.setLevel(logging.INFO)

load_dotenv()

app = FastAPI(
    title="Image Processing Orchestrator",
    description="An orchestrator service that coordinates image processing across multiple services",
    version="1.0.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Service URLs - log them for debugging
STORAGE_SERVICE_URL = os.getenv("STORAGE_SERVICE_URL", "https://2foftaugkqq73jn3jenhxyaxui0gzxff.lambda-url.eu-north-1.on.aws")
IMAGE_SOUND_SERVICE_URL = os.getenv("IMAGE_SOUND_SERVICE_URL", "https://seeing-beyond.vercel.app")
LANDMARK_SERVICE_URL = os.getenv("LANDMARK_SERVICE_URL", "https://lgayrcnofjzy7ztypz5q3ckbbe0adccr.lambda-url.eu-north-1.on.aws")

logger.info(f"STORAGE_SERVICE_URL: {STORAGE_SERVICE_URL}")
logger.info(f"IMAGE_SOUND_SERVICE_URL: {IMAGE_SOUND_SERVICE_URL}")
logger.info(f"LANDMARK_SERVICE_URL: {LANDMARK_SERVICE_URL}")

# Increased timeout for better reliability
TIMEOUT = httpx.Timeout(30.0, connect=10.0)

class ErrorResponse(BaseModel):
    detail: str

class LocationInfo(BaseModel):
    landmark: str
    city: str
    location: dict
    score: float

class ProcessResponse(BaseModel):
    text_description: str
    landmark_info: Optional[LocationInfo] = None

async def upload_to_storage(file: UploadFile) -> tuple[str, str]:
    """Upload image to storage service and return the URL and key"""
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file provided"
        )
    
    if not file.content_type.startswith('image/'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )

    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            form = {"file": (file.filename, await file.read(), file.content_type)}
            logger.info(f"Uploading file {file.filename} to storage service")
            response = await client.post(f"{STORAGE_SERVICE_URL}/upload-image", files=form)
            response.raise_for_status()
            data = response.json()
            logger.info(f"Successfully uploaded file. URL: {data['url']}")
            return data["url"], data["s3_key"]
    except httpx.TimeoutException as e:
        logger.error(f"Timeout while uploading to storage service: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Storage service timed out"
        )
    except httpx.HTTPError as e:
        logger.error(f"Storage service HTTP error: {str(e)}")
        logger.error(f"Response: {e.response.text if hasattr(e, 'response') else 'No response'}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Storage service error: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error during upload: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Upload failed: {str(e)}"
        )

async def delete_from_storage(file_key: str) -> None:
    """Delete image from storage service"""
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            response = await client.delete(f"{STORAGE_SERVICE_URL}/delete/{file_key}")
            if response.status_code not in (200, 404):  # 404 is ok as the file might be already deleted
                logger.error(f"Failed to delete image {file_key} from storage")
    except Exception as e:
        logger.error(f"Error deleting from storage: {str(e)}")
        # Don't raise the exception as this is a cleanup operation

async def get_image_description(image_url: str) -> str:
    """Get image description from Image & Sound Service"""
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            response = await client.post(
                f"{IMAGE_SOUND_SERVICE_URL}/image",
                json={"imageLink": image_url}
            )
            if response.status_code != 200:
                logger.error(f"Image description service returned status {response.status_code}")
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail="Failed to get image description"
                )
            return response.json()["imageDescription"]
    except httpx.TimeoutException:
        logger.error("Timeout while getting image description")
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Image description service timed out"
        )
    except Exception as e:
        logger.error(f"Error getting image description: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to get image description"
        )

async def get_landmark_info(image_url: str) -> dict | None:
    """Get landmark information from Location Detection Service"""
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            response = await client.get(
                f"{LANDMARK_SERVICE_URL}/detect-landmark",
                params={"image_url": image_url}
            )
            if response.status_code == 200:
                return response.json()
            logger.warning(f"Landmark detection returned status {response.status_code}")
    except Exception as e:
        logger.warning(f"Error detecting landmarks: {str(e)}")
    return None

async def text_to_speech(text: str) -> bytes:
    """Convert text to speech using Image & Sound Service"""
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            response = await client.post(
                f"{IMAGE_SOUND_SERVICE_URL}/speak",
                json={"text": text}
            )
            if response.status_code != 200:
                logger.error(f"Text to speech service returned status {response.status_code}")
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail="Failed to convert text to speech"
                )
            return response.content
    except httpx.TimeoutException:
        logger.error("Timeout while converting text to speech")
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Text to speech service timed out"
        )
    except Exception as e:
        logger.error(f"Error converting text to speech: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to convert text to speech"
        )

@app.post(
    "/see-image",
    responses={
        200: {
            "description": "Successfully processed image",
            "content": {
                "audio/wav": {},
                "application/json": {
                    "example": {
                        "text_description": "A group of people walking in a city street",
                        "landmark_info": {
                            "landmark": "Eiffel Tower",
                            "city": "Paris",
                            "location": {"latitude": 48.8584, "longitude": 2.2945},
                            "score": 0.92
                        }
                    }
                }
            }
        },
        400: {
            "description": "Invalid input",
            "model": ErrorResponse
        },
        500: {
            "description": "Internal server error",
            "model": ErrorResponse
        },
        502: {
            "description": "Error communicating with downstream services",
            "model": ErrorResponse
        }
    }
)
async def process_image(
    file: UploadFile = File(
        ...,
        description="The image file to process. Must be in JPG, PNG, or GIF format."
    ),
    format: str = "json"
):
    """
    Process an uploaded image through multiple services:
    
    - Stores the image and generates a secure URL
    - Analyzes the image content for description
    - Detects landmarks and location information
    - Converts the combined analysis to speech
    - Cleans up by removing the stored image
    
    The landmark detection is optional - if this service
    fails, the process will continue with the available information.

    Query Parameters:
        format: str - Either "json" for full JSON response or "audio" for direct audio stream
    """
    image_url = None
    file_key = None
    
    try:
        logger.info(f"Processing image: {file.filename}")
        
        # Required: Upload image to storage
        image_url, file_key = await upload_to_storage(file)
        logger.info(f"Image uploaded successfully. URL: {image_url}")

        # Required: Get image description
        description = await get_image_description(image_url)
        logger.info(f"Got image description: {description}")
        result_text = "I See " + description

        # Optional: Get landmark information
        try:
            landmark_info = await get_landmark_info(image_url)
            if landmark_info:
                logger.info(f"Got landmark info: {json.dumps(landmark_info)}")
                result_text += f". This appears to be {landmark_info['landmark']} in {landmark_info['city']}"
        except Exception as e:
            logger.warning(f"Landmark detection failed (non-critical): {str(e)}")
            landmark_info = None

        # Required: Convert to speech
        logger.info("Converting text to speech...")
        audio_data = await text_to_speech(result_text)
        logger.info(f"Got audio data of length: {len(audio_data)} bytes")
        
        # Required: Delete the stored image
        if file_key:
            await delete_from_storage(file_key)
            logger.info("Cleaned up temporary storage")

        if format.lower() == "audio":
            logger.info("Returning audio response")
            return StreamingResponse(
                io.BytesIO(audio_data),
                media_type="audio/wav",
                headers={
                    "Content-Disposition": f"attachment; filename=description.wav",
                    "Accept-Ranges": "bytes",
                    "Content-Length": str(len(audio_data))
                }
            )

        logger.info("Returning JSON response")
        return JSONResponse(
            content={
                "text_description": result_text,
                "landmark_info": landmark_info
            },
            status_code=status.HTTP_200_OK
        )

    except HTTPException as he:
        logger.error(f"HTTP Exception: {str(he)}")
        if file_key:
            await delete_from_storage(file_key)
        raise he
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        logger.error(traceback.format_exc())
        if file_key:
            await delete_from_storage(file_key)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process image: {str(e)}"
        )

@app.get(
    "/",
    response_model=dict,
    responses={
        200: {
            "description": "Service health check",
            "content": {
                "application/json": {
                    "example": {"status": "healthy"}
                }
            }
        }
    }
)
async def health_check():
    """Check if the service is running and healthy."""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

# Add Lambda handler
handler = Mangum(app)

