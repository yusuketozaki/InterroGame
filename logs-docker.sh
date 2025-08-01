#!/bin/bash

# InterroGame ログ確認スクリプト

# 設定
BACKEND_CONTAINER="interrogame-backend"
FRONTEND_CONTAINER="interrogame-frontend"

echo "📊 InterroGame ログ確認"
echo "========================"

# コンテナの状態確認
echo "📋 コンテナ状態:"
docker ps --filter name=interrogame --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

# どのログを見るか選択
echo "確認したいログを選択してください:"
echo "1) バックエンドログ"
echo "2) フロントエンドログ"
echo "3) 両方のログ（リアルタイム）"
echo "4) 最新50行のログ"
echo "5) エラーログのみ"

read -p "選択 (1-5): " choice

case $choice in
    1)
        echo "📦 バックエンドログ:"
        docker logs -f $BACKEND_CONTAINER
        ;;
    2)
        echo "📦 フロントエンドログ:"
        docker logs -f $FRONTEND_CONTAINER
        ;;
    3)
        echo "📦 両方のログ（リアルタイム）:"
        docker logs -f $BACKEND_CONTAINER &
        docker logs -f $FRONTEND_CONTAINER &
        wait
        ;;
    4)
        echo "📦 最新50行のログ:"
        echo "--- バックエンド ---"
        docker logs --tail 50 $BACKEND_CONTAINER
        echo ""
        echo "--- フロントエンド ---"
        docker logs --tail 50 $FRONTEND_CONTAINER
        ;;
    5)
        echo "📦 エラーログのみ:"
        echo "--- バックエンドエラー ---"
        docker logs $BACKEND_CONTAINER 2>&1 | grep -i error || echo "エラーなし"
        echo ""
        echo "--- フロントエンドエラー ---"
        docker logs $FRONTEND_CONTAINER 2>&1 | grep -i error || echo "エラーなし"
        ;;
    *)
        echo "無効な選択です。"
        exit 1
        ;;
esac
