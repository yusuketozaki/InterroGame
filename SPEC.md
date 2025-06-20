# InterroGame 仕様書

## システム構成
- フロントエンド: React + Vite + TypeScript
- バックエンド: Python 3.11系, FastAPI 0.111, Uvicorn 0.29

## ディレクトリ構成
- `src/` : フロントエンド
- `backend/` : バックエンド

## バージョン
- Node.js: 20.x 以上
- npm: 10.x 以上
- Python: 3.11.x
- FastAPI: 0.111.x
- Uvicorn: 0.29.x

## セットアップ手順
1. `setup.sh` を実行
2. フロントエンド: `npm run dev`
3. バックエンド: `source backend/venv/bin/activate && uvicorn backend.main:app --reload`

## API設計
- API設計やエンドポイント仕様はREADMEまたは本ファイルに追記
