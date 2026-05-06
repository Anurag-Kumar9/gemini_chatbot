import io
import asyncio
import PyPDF2
from fastapi import UploadFile, HTTPException

def _extract_pdf_sync(file_bytes: bytes) -> str:
    """Synchronous CPU-bound PDF extraction."""
    reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
    text = ""
    for page in reader.pages:
        extracted = page.extract_text()
        if extracted:
            text += extracted + "\n"
    return text.strip()

async def parse_uploaded_file(file: UploadFile) -> dict:
    """
    Reads the uploaded file and routes it to the appropriate parser.
    Returns a dictionary structured for the Gemini API.
    """
    # I/O bound, safe to await directly
    file_bytes = await file.read()
    filename = file.filename.lower()

    if filename.endswith('.txt'):
        # Simple text decoding
        return {
            "type": "text", 
            "content": file_bytes.decode('utf-8', errors='ignore')
        }
        
    elif filename.endswith('.pdf'):
        # Offload the heavy synchronous PDF parsing to a background thread
        extracted_text = await asyncio.to_thread(_extract_pdf_sync, file_bytes)
        return {
            "type": "text", 
            "content": extracted_text
        }
        
    elif filename.endswith(('.png', '.jpg', '.jpeg')):
        # Gemini Vision needs raw bytes and the exact mime type[cite: 1]
        return {
            "type": "image", 
            "mime_type": file.content_type, 
            "data": file_bytes
        }
        
    else:
        raise HTTPException(status_code=400, detail="Unsupported file format. Only PDF, TXT, PNG, and JPG are allowed.")