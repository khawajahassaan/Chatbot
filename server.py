from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import os
from dotenv import load_dotenv

load_dotenv()
hf_token = os.getenv("HF_TOKEN")
if not hf_token:
    raise ValueError("HF_TOKEN not found in environment variables. Please get a free token from huggingface.co")

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
            "Authorization": f"Bearer {hf_token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "google/gemma-3-270m-it",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": req.message}
            ],
            "max_tokens": 512,
        }
        
        # Use the OpenAI compatible chat completions endpoint for HuggingFace
        response = requests.post(
            "https://api-inference.huggingface.co/models/google/gemma-3-270m-it/v1/chat/completions",
            headers=headers,
            json=payload
        )
        
        response.raise_for_status()
        data = response.json()
        
        reply = data["choices"][0]["message"]["content"]
        return {"reply": reply}
        
    except Exception as e:
        return {"reply": f"An error occurred: {str(e)}"}
