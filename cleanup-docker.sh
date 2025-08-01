#!/bin/bash

# InterroGame 完全削除スクリプト
set -e

echo "🗑️ InterroGame を完全削除中..."

# 設定
BACKEND_CONTAINER="interrogame-backend"
FRONTEND_CONTAINER="interrogame-frontend"
NETWORK_NAME="interrogame-network"
VOLUME_NAME="interrogame-ollama-data"

# 確認
read -p "⚠️  全てのデータが削除されます。続行しますか？ (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "キャンセルしました。"
    exit 1
fi

# コンテナを停止・削除
echo "📦 コンテナを停止・削除中..."
docker stop $BACKEND_CONTAINER $FRONTEND_CONTAINER 2>/dev/null || true
docker rm $BACKEND_CONTAINER $FRONTEND_CONTAINER 2>/dev/null || true

# イメージを削除
echo "🖼️ Dockerイメージを削除中..."
docker rmi interrogame-backend:latest interrogame-frontend:latest 2>/dev/null || true

# ボリュームを削除
echo "💾 Dockerボリュームを削除中..."
docker volume rm $VOLUME_NAME 2>/dev/null || true

# ネットワークを削除
echo "🌐 Dockerネットワークを削除中..."
docker network rm $NETWORK_NAME 2>/dev/null || true

# 未使用のリソースをクリーンアップ
echo "🧹 未使用のDockerリソースをクリーンアップ中..."
docker system prune -f

echo "✅ InterroGame を完全に削除しました"
echo "📝 再インストールするには: ./deploy-docker.sh"
