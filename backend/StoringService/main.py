from fastapi import FastAPI, UploadFile, File, HTTPException
import boto3
import uuid
import os
from dotenv import load_dotenv
import os
import boto3

load_dotenv()

s3 = boto3.client(
    "s3",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name=os.getenv("AWS_REGION", "us-east-1")
)



app = FastAPI()

s3 = boto3.client(
    "s3",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name=os.getenv("AWS_REGION")
)

BUCKET_NAME = os.getenv("AWS_BUCKET_NAME", "ml-temp-bucket")

def upload_to_s3(file_bytes: bytes, file_extension="png") -> str:
    """Uploads the file to S3 and returns the object key."""
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

def generate_presigned_url(file_name: str, expiration: int = 300) -> str:
    """Generate a temporary pre-signed URL."""
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

    # Extract extension safely
    file_extension = file.filename.split('.')[-1].lower()
    if file_extension not in ["jpg", "jpeg", "png", "gif", "bmp"]:
        raise HTTPException(status_code=400, detail="Invalid file type")

    # Upload to S3
    s3_key = upload_to_s3(file_bytes, file_extension)

    # Generate pre-signed URL (valid for 5 mins by default)
    url = generate_presigned_url(s3_key,expiration=3600)

    return {"url": url, "s3_key": s3_key}
