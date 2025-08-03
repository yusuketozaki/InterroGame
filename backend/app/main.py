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
    model: str = "qwen3:8b"  # デフォルトモデル
    system_message: str
    messages: dict[str, Message]
    stream: bool = False
    think: bool = False


def generate_response(form_data: ChatCompletionForm):
    # フロントエンドから送信されたモデルを使用、フォールバックとしてデフォルトを使用
    model = form_data.model or "qwen3:8b"
    system_message = form_data.system_message

    print(f"Using model: {model}")  # デバッグ用ログ

    messages = [{"role": "system", "content": system_message}]

    for message in form_data.messages.values():
        messages.append({"role": message.role, "content": message.content})

    try:
        response: ChatResponse = chat(
            model=model,
            messages=messages,
            stream=form_data.stream,
            think=form_data.think,
        )
        return response.message.content
    except Exception as e:
        print(f"Error with model {model}: {e}")
        # フォールバックとしてデフォルトモデルを試す
        if model != "qwen3:8b":
            print("Falling back to default model: qwen3:8b")
            response: ChatResponse = chat(
                model="qwen3:8b",
                messages=messages,
                stream=form_data.stream,
                think=form_data.think,
            )
            return response.message.content
        else:
            raise e


@app.get("/v1/api/health")
async def health_check():
    return {"status": "healthy", "message": "InterroGame API is running"}


@app.post("/v1/api/chat")
async def response(form_data: ChatCompletionForm):
    response = generate_response(form_data)
    return {"message": response}
