from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from ollama import ChatResponse, chat
from pydantic import BaseModel

app = FastAPI(title="InterroGame API", version="1.0.0")

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 本番環境では適切なドメインを指定
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Message(BaseModel):
    role: str
    content: str


class ChatCompletionForm(BaseModel):
    system_message: str
    messages: dict[str, Message]
    stream: bool = False
    think: bool = False


def generate_response(form_data: ChatCompletionForm):
    model = "qwen3:8b"
    system_message = form_data.system_message

    messages = [{"role": "system", "content": system_message}]

    for message in form_data.messages.values():
        messages.append({"role": message.role, "content": message.content})

    response: ChatResponse = chat(
        model=model,
        messages=messages,
        stream=form_data.stream,
        think=form_data.think,
    )
    return response.message.content


@app.get("/v1/api/health")
async def health_check():
    return {"status": "healthy", "message": "InterroGame API is running"}


@app.post("/v1/api/chat")
async def response(form_data: ChatCompletionForm):
    response = generate_response(form_data)
    return {"message": response}
