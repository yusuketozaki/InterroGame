#!/bin/bash
# InterroGame 環境構築スクリプト
set -e

# フロントエンド依存インストール
if [ -f package.json ]; then
  echo "[frontend] npm install"
  npm install
fi

# バックエンド依存インストール
# if [ -d backend ]; then
#   echo "[backend] python -m venv backend/venv"
#   python3 -m venv backend/venv
#   source backend/venv/bin/activate
#   pip install --upgrade pip
#   pip install fastapi uvicorn
#   deactivate
# fi

echo "\nセットアップ完了: frontend→ npm run dev, backend→ backend/venv/bin/uvicorn backend.main:app --reload"
