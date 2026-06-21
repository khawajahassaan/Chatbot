from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import os
from dotenv import load_dotenv

load_dotenv()
groq_api_key = os.getenv("GROQ_API_KEY")
if not groq_api_key:
    raise ValueError("GROQ_API_KEY not found in environment variables. Please get a free key from console.groq.com")

app = FastAPI()

app.add_middleware(
    CORSMiddleware, 
    allow_origins=["*"], 
    allow_methods=["*"], 
    allow_headers=["*"]
)

class ChatRequest(BaseModel):
    message: str

@app.post("/api/chat")
async def chat_endpoint(req: ChatRequest):
    try:
        headers = {
            "Authorization": f"Bearer {groq_api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "llama-3.1-8b-instant",
            "messages": [
                {"role": "system", "content": "You are a helpful assistant. Keep your answers extremely concise, straightforward, and direct. Do not write fluff, gibberish, or unnecessary conversational filler. Just get straight to the point. If anyone asks who made, created, or programmed you, you must answer that you were made by Hassaan Tariq."},
                {"role": "user", "content": req.message}
            ],
            "max_tokens": 1024,
        }
        
        # Use Groq's OpenAI compatible endpoint
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers=headers,
            json=payload
        )
        
        if not response.ok:
            return {"reply": f"Groq Error {response.status_code}: {response.text}"}
        
        data = response.json()
        
        reply = data["choices"][0]["message"]["content"]
        return {"reply": reply}
        
    except Exception as e:
        return {"reply": f"An error occurred: {str(e)}"}
