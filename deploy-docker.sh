#!/bin/bash

# InterroGame 単体Docker デプロイメントスクリプト
set -e

echo "🚀 InterroGame デプロイメント開始（Docker単体版）..."

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

# 3. ボリュームの作成（存在しない場合）
echo "💾 Dockerボリュームを作成中..."
docker volume create $VOLUME_NAME 2>/dev/null || echo "ボリューム $VOLUME_NAME は既に存在します"

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
  -v $VOLUME_NAME:/root/.ollama \
  -e OLLAMA_HOST=0.0.0.0:11434 \
  --restart unless-stopped \
  --gpus all \
  interrogame-backend:latest

# 7. フロントエンドコンテナを起動
echo "▶️ フロントエンドコンテナを起動中..."
docker run -d \
  --name $FRONTEND_CONTAINER \
  --network $NETWORK_NAME \
  -p 80:80 \
  --restart unless-stopped \
  interrogame-frontend:latest

# 8. ヘルスチェック
echo "🏥 ヘルスチェック中..."
sleep 30

# バックエンドのヘルスチェック
echo "バックエンドの起動を確認中..."
for i in {1..10}; do
  if curl -f http://localhost:8000/v1/api/health > /dev/null 2>&1; then
    echo "✅ バックエンドが正常に起動しました"
    break
  else
    echo "バックエンド起動待機中... ($i/10)"
    sleep 10
  fi
  
  if [ $i -eq 10 ]; then
    echo "❌ バックエンドの起動に失敗しました"
    docker logs $BACKEND_CONTAINER
    exit 1
  fi
done

# フロントエンドのヘルスチェック
echo "フロントエンドの起動を確認中..."
if curl -f http://localhost:80 > /dev/null 2>&1; then
  echo "✅ フロントエンドが正常に起動しました"
else
  echo "❌ フロントエンドの起動に失敗しました"
  docker logs $FRONTEND_CONTAINER
  exit 1
fi

echo "🎉 デプロイメント完了！"
echo "📍 アクセス先: http://localhost"
echo "📊 ログ確認:"
echo "  - バックエンド: docker logs -f $BACKEND_CONTAINER"
echo "  - フロントエンド: docker logs -f $FRONTEND_CONTAINER"
echo ""
echo "🛠️ 管理コマンド:"
echo "  - 停止: docker stop $BACKEND_CONTAINER $FRONTEND_CONTAINER"
echo "  - 再起動: docker restart $BACKEND_CONTAINER $FRONTEND_CONTAINER"
echo "  - 削除: docker rm -f $BACKEND_CONTAINER $FRONTEND_CONTAINER"
