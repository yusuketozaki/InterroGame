#!/bin/bash

# Ollamaサーバーをバックグラウンドで起動
ollama serve &

# Ollamaサーバーが起動するまで待機
sleep 10

# モデルが存在しない場合は、qwen2.5:7bをプル
if ! ollama list | grep -q "qwen3:8b"; then
    echo "Pulling qwen3:8b model..."
    ollama pull qwen3:b
fi

# FastAPIアプリケーションを起動
cd /app
exec uv run uvicorn app.main:app --host 0.0.0.0 --port 8000
