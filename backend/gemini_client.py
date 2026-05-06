import os
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

client = genai.Client()

MODEL_ID = 'gemini-2.5-flash' 

async def get_gemini_response(history: list, new_message: str, parsed_file: dict = None) -> tuple[str, list]:
    """
    Takes the in-memory history, the new user message, and parsed file data,
    formats it for the new google-genai SDK, and returns the response.
    """
    
    # Format the current turn's parts
    current_parts = []
    
    if parsed_file:
        if parsed_file["type"] == "text":
            # Sandwich the text
            combined_text = f"Document Context:\n{parsed_file['content']}\n\nUser Query: {new_message}"
            current_parts.append(types.Part.from_text(text=combined_text))
        elif parsed_file["type"] == "image":
            # Pass the raw bytes and mime type using the new Part structure
            current_parts.append(types.Part.from_bytes(
                data=parsed_file["data"],
                mime_type=parsed_file["mime_type"]
            ))
            current_parts.append(types.Part.from_text(text=new_message))
    else:
        current_parts.append(types.Part.from_text(text=new_message))

    # Format the history into the new SDK's Content objects
    formatted_history = []
    for turn in history:
        history_parts = []
        for p in turn["parts"]:
            # Reconstruct the parts based on whether they are strings or image dicts
            if isinstance(p, str):
                history_parts.append(types.Part.from_text(text=p))
            else:
                history_parts.append(types.Part.from_bytes(data=p["data"], mime_type=p["mime_type"]))
                
        formatted_history.append(
            types.Content(role=turn["role"], parts=history_parts)
        )

    # Initialize the chat with the history
    chat = client.chats.create(
        model=MODEL_ID,
        config=types.GenerateContentConfig(
            temperature=0.7,
        ),
        history=formatted_history
    )
    
    # Send the new multimodal message
    response = chat.send_message(current_parts)
    
    # Return the text, plus the raw parts (un-typed) so main.py can store them in the simple dict format
    raw_current_parts = []
    if parsed_file and parsed_file["type"] == "text":
        raw_current_parts.append(combined_text)
    elif parsed_file and parsed_file["type"] == "image":
         raw_current_parts.append({"mime_type": parsed_file["mime_type"], "data": parsed_file["data"]})
         raw_current_parts.append(new_message)
    else:
         raw_current_parts.append(new_message)

    return response.text, raw_current_parts