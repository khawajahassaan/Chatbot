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

KNOWLEDGE_BASE = [
    "The Sun is Yellow",
    "The Sky is Blue",
    "Fast is situated in Behens Colony"
]

class ChatRequest(BaseModel):
    message: str
    use_general_knowledge: bool = False

@app.post("/api/chat")
async def chat_endpoint(req: ChatRequest):
    try:
        context = "\n".join(KNOWLEDGE_BASE)

        if req.use_general_knowledge:
            system_prompt = f"You are a helpful assistant. Try to answer the user's question using the context provided below. If the context is not relevant, use your own general knowledge.\n\nContext:\n{context}"
        else:
            system_prompt = f"You are a helpful assistant. Answer the user's question using ONLY the context provided below. If the answer is not in the context, say 'I don't have information on that.'\n\nContext:\n{context}"

        headers = {
            "Authorization": f"Bearer {groq_api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "gemma2-9b-it",
            "messages": [
                {"role": "user", "content": f"{system_prompt}\n\n{req.message}"}
            ],
            "max_tokens": 512,
        }
        
        # Use Groq's OpenAI compatible endpoint
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers=headers,
            json=payload
        )
        
        response.raise_for_status()
        data = response.json()
        
        reply = data["choices"][0]["message"]["content"]
        return {"reply": reply}
        
    except Exception as e:
        return {"reply": f"An error occurred: {str(e)}"}
