# Gemini Multimodal Chatbot - Infollion Task

This repository contains a minimal web-based chatbot built using Google's Gemini API, demonstrating API integration, file handling, and simple in-memory state management.

## Architecture

* **Backend:** Python, FastAPI, `google-genai` (modern SDK), PyPDF2.
* **Frontend:** React, Vite, Tailwind CSS.
* **Storage:** Strictly in-memory session management (no database).

## Prerequisites

* Python 3.9+
* Node.js 18+
* A valid Google Gemini API Key.

---

## 1. Backend Setup & Execution

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```

2.  Create and activate a virtual environment (do not skip this):
    ```bash
    # Windows
    python -m venv venv
    venv\Scripts\activate
    
    # Mac/Linux
    python3 -m venv venv
    source venv/bin/activate
    ```

3.  Install dependencies:
    ```bash
    pip install fastapi uvicorn python-multipart google-genai pypdf2 python-dotenv
    ```

4.  Set your Gemini API Key:
    Create a file named `.env` in the `backend/` directory and add your key:
    ```env
    GEMINI_API_KEY=your_actual_api_key_here
    ```

5.  Run the server:
    ```bash
    uvicorn main:app --reload
    ```
    The backend will be available at `http://localhost:8000`. You can test the endpoints directly via the Swagger UI at `http://localhost:8000/docs`.

---

## 2. Frontend Setup & Execution

1.  Open a new terminal and navigate to the frontend directory:
    ```bash
    cd frontend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Configure the environment:
    Create a file named `.env` in the `frontend/` directory and point it to the backend:
    ```env
    VITE_BACKEND_URL=http://localhost:8000
    ```

4.  Run the development server:
    ```bash
    npm run dev
    ```
    The UI will typically be available at `http://localhost:5173`.

---

## 3. Example Usage Steps

1.  **Text Chat:** Open the frontend, type a message like "Explain quantum computing in one sentence," and hit send.
2.  **Document Q&A:** Click the attachment icon, select a `.pdf` or `.txt` file, type "Summarize this document," and send. The backend extracts the text safely and feeds it to Gemini.
3.  **Image Q&A:** Click the image icon, select a `.png` or `.jpg` file, type "What is in this image?", and send. The raw image bytes are sent to the multimodal model.
4.  **Context Retention:** Ask a follow-up question without attaching a file (e.g., "What was the second point in that summary?"). The bot will remember the session context.
5.  **Context Reset:** Click the "New Chat" button in the UI. This explicitly deletes the session from the backend's memory and generates a fresh Client ID.

## Notes & Constraints
* **Do not upload massive PDFs.** Extraction is CPU-bound and handled asynchronously, but passing thousands of tokens will hit the Gemini API rate limits.
* State is stored in a Python dictionary. Restarting the backend server will wipe all active chat histories.