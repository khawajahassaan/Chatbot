from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY not found in environment variables")
genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-flash-latest')

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
            prompt = f"""
            You are a helpful assistant. Try to answer the user's question using the context provided below. 
            If the context is not relevant or doesn't contain the answer, use your own general knowledge to answer the question.
            
            Context:
            {context}
            
            User Question: {req.message}
            """
        else:
            prompt = f"""
            You are a helpful assistant. Answer the user's question using ONLY the context provided below. 
            If the answer is not in the context, say "I don't have information on that."
            
            Context:
            {context}
            
            User Question: {req.message}
            """

        response = model.generate_content(prompt)
        return {"reply": response.text}
        
    except Exception as e:
        return {"reply": f"An error occurred: {str(e)}"}
