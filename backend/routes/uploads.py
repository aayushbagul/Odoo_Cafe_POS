from fastapi import APIRouter, UploadFile, File, HTTPException
import os
import uuid
from pathlib import Path

router = APIRouter(prefix="/uploads")

# Create directory if it doesn't exist
UPLOAD_DIR = Path("static/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Generate a unique filename to prevent overwrites
    ext = file.filename.split('.')[-1]
    unique_filename = f"{uuid.uuid4()}.{ext}"
    file_path = UPLOAD_DIR / unique_filename
    
    # Save the file
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
        
    # Return the public URL
    image_url = f"http://localhost:8000/static/uploads/{unique_filename}"
    return {"image_url": image_url}