#!/bin/bash

# InterroGame スタンドアロンDocker デプロイメントスクリプト
# Docker Composeを使わずに個別のdockerコマンドでデプロイ

set -e

echo "🚀 InterroGame Docker デプロイメント開始..."

# 設定
NETWORK_NAME="interrogame-network"
BACKEND_CONTAINER="interrogame-backend"
FRONTEND_CONTAINER="interrogame-frontend"
VOLUME_NAME="interrogame-ollama-data"

# 1. 既存のコンテナを停止・削除
echo "📦 既存のコンテナを停止・削除中..."
docker stop $BACKEND_CONTAINER $FRONTEND_CONTAINER 2>/dev/null || true
docker rm $BACKEND_CONTAINER $FRONTEND_CONTAINER 2>/dev/null || true

# 2. ネットワークの作成（存在しない場合）
echo "🌐 Dockerネットワークを作成中..."
docker network create $NETWORK_NAME 2>/dev/null || echo "ネットワーク $NETWORK_NAME は既に存在します"

# 3. ローカルディレクトリでOllamaデータを管理
echo "💾 ローカルOllamaディレクトリを作成中..."
OLLAMA_DATA_DIR="$(pwd)/ollama-data"
mkdir -p "$OLLAMA_DATA_DIR"
echo "📍 Ollamaデータ保存先: $OLLAMA_DATA_DIR"

# 4. バックエンドDockerイメージをビルド
echo "🔨 バックエンドDockerイメージをビルド中..."
docker build -t interrogame-backend:latest -f Dockerfile.backend .

# 5. フロントエンドDockerイメージをビルド
echo "🔨 フロントエンドDockerイメージをビルド中..."
docker build -t interrogame-frontend:latest -f Dockerfile.frontend .

# 6. バックエンドコンテナを起動
echo "▶️ バックエンドコンテナを起動中..."
docker run -d \
  --name $BACKEND_CONTAINER \
  --network $NETWORK_NAME \
  -p 8000:8000 \
  -v "$OLLAMA_DATA_DIR:/root/.ollama" \
  -e OLLAMA_HOST=0.0.0.0:11434 \
  --restart unless-stopped \
  --gpus all \
  interrogame-backend:latest

# 7. フロントエンドコンテナを起動
echo "▶️ フロントエンドコンテナを起動中..."
docker run -d \
  --name $FRONTEND_CONTAINER \
  --network $NETWORK_NAME \
  -p 8080:80 \
  --restart unless-stopped \
  interrogame-frontend:latest

# 8. ヘルスチェック
echo "🏥 ヘルスチェック中..."
echo "Ollamaモデルのダウンロードには時間がかかる場合があります..."
sleep 45

# バックエンドのヘルスチェック
echo "バックエンドの起動を確認中..."
for i in {1..15}; do
  if curl -f http://localhost:8000/v1/api/health > /dev/null 2>&1; then
    echo "✅ バックエンドが正常に起動しました"
    break
  else
    echo "Backend startup waiting... ${i}/15 - Model downloading may be in progress"

    # 3回に1回、ディスク容量を監視
    if [ $((i % 3)) -eq 0 ]; then
        echo "💾 現在のディスク使用量:"
        df -h / | head -2
        echo "📦 Ollamaディレクトリサイズ:"
        du -sh "$OLLAMA_DATA_DIR" 2>/dev/null || echo "まだ作成されていません"
        echo ""
    fi

    sleep 20
  fi

  if [ $i -eq 15 ]; then
    echo "❌ バックエンドの起動に失敗しました"
    echo "� 最終ディスク使用量チェック:"
    df -h /
    echo "📦 Ollamaディレクトリの状況:"
    ls -la "$OLLAMA_DATA_DIR" 2>/dev/null || echo "ディレクトリが存在しません"
    echo ""
    echo "�📋 バックエンドログ:"
    docker logs --tail 50 $BACKEND_CONTAINER
    echo ""
    echo "🔍 Ollamaの状況を確認中..."
    docker exec $BACKEND_CONTAINER ollama list || echo "Ollamaコマンドの実行に失敗"
    echo ""
    echo "🔧 トラブルシューティング:"
    echo "  - Ollamaデータ場所: $OLLAMA_DATA_DIR"
    echo "  - ディスク容量確認: df -h"
    echo "  - ディレクトリサイズ確認: du -sh $OLLAMA_DATA_DIR"
    exit 1
  fi
done

# フロントエンドのヘルスチェック
echo "フロントエンドの起動を確認中..."
if curl -f http://localhost:8080 > /dev/null 2>&1; then
  echo "✅ フロントエンドが正常に起動しました"
else
  echo "❌ フロントエンドの起動に失敗しました"
  docker logs $FRONTEND_CONTAINER
  exit 1
fi

echo "🎉 デプロイメント完了！"
echo "📍 アクセス先: http://localhost:8080"
echo "📊 ログ確認:"
echo "  - バックエンド: docker logs -f $BACKEND_CONTAINER"
echo "  - フロントエンド: docker logs -f $FRONTEND_CONTAINER"
echo ""
echo "🛠️ 管理コマンド:"
echo "  - 停止: docker stop $BACKEND_CONTAINER $FRONTEND_CONTAINER"
echo "  - 再起動: docker restart $BACKEND_CONTAINER $FRONTEND_CONTAINER"
echo "  - 削除: docker rm -f $BACKEND_CONTAINER $FRONTEND_CONTAINER"
