from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

# Import custom modules
from file_parsers import parse_uploaded_file
from gemini_client import get_gemini_response

# Initialize FastAPI
app = FastAPI(title="Gemini Chatbot API")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Format: { chat_id: [{"role": "user", "parts": [...]}, {"role": "model", "parts": [...]}] }
chat_sessions = {}

@app.post("/api/chat")
async def process_chat(
    chat_id: str = Form(...),
    message: str = Form(...),
    file: Optional[UploadFile] = File(None)
):
    """
    Handles incoming chat messages, files, and maintains session context.
    """
    # Initialize fresh context if it's a new chat_id
    if chat_id not in chat_sessions:
        chat_sessions[chat_id] = []
    
    current_history = chat_sessions[chat_id]
    
    # Extract Data from Files
    parsed_file = None
    if file:
        try:
            # Route to asynchronous parser
            parsed_file = await parse_uploaded_file(file)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"File parsing error: {str(e)}")

    # Call Gemini API
    try:
        # Pass the history, the new message, and the parsed file dict
        bot_response, raw_user_parts = await get_gemini_response(
            history=current_history, 
            new_message=message, 
            parsed_file=parsed_file
        )
    except Exception as e:
        # If Gemini rate-limits you or throws a fit, don't crash the server
        raise HTTPException(status_code=500, detail=f"Gemini API Error: {str(e)}")

    # Update Memory
    # Append the user's turn
    current_history.append({
        "role": "user",
        "parts": raw_user_parts
    })
    
    # Append the model's turn
    current_history.append({
        "role": "model",
        "parts": [bot_response]
    })

    return {
        "chat_id": chat_id,
        "response": bot_response
    }

@app.delete("/api/chat/{chat_id}")
async def reset_chat(chat_id: str):
    """
    Clears the chat history from server memory to prevent bloating.
    """
    if chat_id in chat_sessions:
        del chat_sessions[chat_id]
        return {"status": "success", "message": f"Chat {chat_id} wiped from memory."}
    
    return {"status": "ignored", "message": "Chat ID not found."}