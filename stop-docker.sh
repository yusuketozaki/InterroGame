#!/bin/bash

# InterroGame 停止スクリプト
set -e

echo "🛑 InterroGame を停止中..."

# 設定
BACKEND_CONTAINER="interrogame-backend"
FRONTEND_CONTAINER="interrogame-frontend"
NETWORK_NAME="interrogame-network"

# コンテナを停止
echo "📦 コンテナを停止中..."
docker stop $BACKEND_CONTAINER $FRONTEND_CONTAINER 2>/dev/null || true

# コンテナを削除
echo "🗑️ コンテナを削除中..."
docker rm $BACKEND_CONTAINER $FRONTEND_CONTAINER 2>/dev/null || true

echo "✅ InterroGame を停止しました"
echo ""
echo "📝 補足:"
echo "  - データは保持されています（Dockerボリューム）"
echo "  - 再起動: ./deploy-docker.sh"
echo "  - 完全削除: ./cleanup-docker.sh"
