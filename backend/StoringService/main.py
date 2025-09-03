from fastapi import FastAPI, UploadFile, File, HTTPException
from dotenv import load_dotenv
from mangum import Mangum
import boto3
import uuid
import os

# Load environment variables from .env
load_dotenv()

# Configuration
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION", "eu-north-1")  # Stockholm
BUCKET_NAME = os.getenv("AWS_BUCKET_NAME", "ml-temp-bucket")

if not AWS_ACCESS_KEY_ID or not AWS_SECRET_ACCESS_KEY:
    raise RuntimeError("AWS credentials not set in environment variables")

# Initialize S3 client
s3 = boto3.client(
    "s3",
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    endpoint_url="https://s3.eu-north-1.amazonaws.com",
    region_name="eu-north-1"
)

# FastAPI app
app = FastAPI()


def upload_to_s3(file_bytes: bytes, file_extension: str) -> str:
    """Upload bytes to S3 and return the object key"""
    file_name = f"{uuid.uuid4()}.{file_extension}"
    try:
        s3.put_object(
            Bucket=BUCKET_NAME,
            Key=file_name,
            Body=file_bytes,
            ContentType=f"image/{file_extension}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"S3 Upload Failed: {str(e)}")
    return file_name


def generate_url(file_name: str, expiration: int = 3600) -> str:
    """Generate a temporary pre-signed URL for the uploaded object"""
    try:
        url = s3.generate_presigned_url(
            ClientMethod="get_object",
            Params={"Bucket": BUCKET_NAME, "Key": file_name},
            ExpiresIn=expiration
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"URL Generation Failed: {str(e)}")
    return url


@app.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")

    # Read file bytes
    file_bytes = await file.read()

    # Extract file extension
    file_extension = file.filename.split('.')[-1].lower()
    if file_extension not in ["jpg", "jpeg", "png", "gif", "bmp"]:
        raise HTTPException(status_code=400, detail="Invalid file type")

    # Upload to S3
    s3_key = upload_to_s3(file_bytes, file_extension)

    # Generate pre-signed URL (valid for 1 hour)
    url = generate_url(s3_key, expiration=3600)

    return {"url": url, "s3_key": s3_key}

@app.delete("/delete/{file_name}")
async def delete_image(file_name: str):
    """
    Delete an image from the S3 bucket.
    The `file_name` should be the exact key returned when uploading.
    """
    try:
        s3.delete_object(Bucket=BUCKET_NAME, Key=file_name)
    except s3.exceptions.NoSuchKey:
        raise HTTPException(status_code=404, detail="File not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete file: {str(e)}")

    return {"detail": f"File '{file_name}' deleted successfully"}

# 🔹 Add Lambda handler
handler = Mangum(app)