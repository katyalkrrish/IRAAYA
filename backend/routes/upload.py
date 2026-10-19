from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv
import os

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
)

from auth.jwt_handler import get_admin_user

router = APIRouter(prefix="/api/upload", tags=["Upload"])


@router.post("")
async def upload_image(file: UploadFile = File(...), admin=Depends(get_admin_user)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    contents = await file.read()

    try:
        result = cloudinary.uploader.upload(
            contents,
            folder="iraaya",
            allowed_formats=["jpg", "jpeg", "png", "webp"],
            transformation=[{"width": 800, "height": 800, "crop": "limit", "quality": "auto"}]
        )
        return {"url": result["secure_url"], "public_id": result["public_id"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
