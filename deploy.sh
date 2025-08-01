#!/bin/bash

# InterroGame デプロイメントスクリプト
set -e

echo "🚀 InterroGame デプロイメント開始..."

# 1. 既存のコンテナを停止・削除
echo "📦 既存のコンテナを停止・削除中..."
docker-compose down --remove-orphans

# 2. 古いイメージを削除（オプション）
echo "🗑️ 古いイメージを削除中..."
docker system prune -f

# 3. Dockerイメージをビルド
echo "🔨 Dockerイメージをビルド中..."
docker-compose build --no-cache

# 4. コンテナを起動
echo "▶️ コンテナを起動中..."
docker-compose up -d

# 5. ヘルスチェック
echo "🏥 ヘルスチェック中..."
sleep 30

# バックエンドのヘルスチェック
if curl -f http://localhost:8000/v1/api/health > /dev/null 2>&1; then
    echo "✅ バックエンドが正常に起動しました"
else
    echo "❌ バックエンドの起動に失敗しました"
    docker-compose logs backend
    exit 1
fi

# フロントエンドのヘルスチェック
if curl -f http://localhost:80 > /dev/null 2>&1; then
    echo "✅ フロントエンドが正常に起動しました"
else
    echo "❌ フロントエンドの起動に失敗しました"
    docker-compose logs frontend
    exit 1
fi

echo "🎉 デプロイメント完了！"
echo "📍 アクセス先: http://localhost"
echo "📊 ログ確認: docker-compose logs -f"
