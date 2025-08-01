# 🐳 InterroGame Docker単体セットアップガイド

## 📋 概要
Docker Composeを使わずに、個別のDockerコンテナでInterroGameをセットアップする方法です。

## 🛠️ 前提条件
- Docker CE (最新版)
- NVIDIA GPU + NVIDIA Docker Runtime（推奨）
- 最低8GB RAM、20GB以上の空きディスク容量

## 🚀 セットアップ手順

### 1. プロジェクトを取得
```bash
git clone https://github.com/yusuketozaki/InterroGame.git
cd InterroGame
```

### 2. スクリプトに実行権限を付与
```bash
chmod +x deploy-docker.sh stop-docker.sh cleanup-docker.sh logs-docker.sh
```

### 3. デプロイ実行
```bash
./deploy-docker.sh
```

## 🔧 管理コマンド

### 基本操作
```bash
# デプロイ（初回・再デプロイ）
./deploy-docker.sh

# 停止
./stop-docker.sh

# ログ確認（対話式）
./logs-docker.sh

# 完全削除（データも含む）
./cleanup-docker.sh
```

### 手動操作
```bash
# コンテナ状態確認
docker ps --filter name=interrogame

# 個別再起動
docker restart interrogame-backend
docker restart interrogame-frontend

# 個別ログ確認
docker logs -f interrogame-backend
docker logs -f interrogame-frontend
```

## 🌐 アクセス方法

### 直接アクセス
- **ゲーム**: http://localhost
- **API**: http://localhost:8000/v1/api/health

### SSH経由（リモートサーバーの場合）
```bash
# ローカルPCで実行
ssh -L 8080:localhost:80 -L 8001:localhost:8000 user@server-ip

# ブラウザでアクセス
# http://localhost:8080
```

## 🔧 トラブルシューティング

### よくある問題

#### 1. ポートが使用中
```bash
# ポート確認
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :8000

# 既存プロセス停止
sudo lsof -ti:80 | xargs kill -9
sudo lsof -ti:8000 | xargs kill -9
```

#### 2. GPU認識されない
```bash
# GPU確認
nvidia-smi
docker run --rm --gpus all nvidia/cuda:11.0-base nvidia-smi
```

#### 3. メモリ不足
```bash
# リソース使用量確認
docker stats interrogame-backend interrogame-frontend

# 不要なリソース削除
docker system prune -a
```

#### 4. モデルダウンロード失敗
```bash
# 手動でモデルダウンロード
docker exec -it interrogame-backend ollama pull qwen3:8b
```

## 📝 詳細情報

### 使用ポート
- **80**: フロントエンド（Nginx）
- **8000**: バックエンド（FastAPI）

### 作成されるリソース
- **ネットワーク**: interrogame-network
- **ボリューム**: interrogame-ollama-data
- **コンテナ**: interrogame-backend, interrogame-frontend

### データの永続化
- Ollamaモデルデータは `interrogame-ollama-data` ボリュームに保存
- コンテナを削除してもモデルデータは保持される

## 🎯 アクセス先まとめ
- **ローカル**: http://localhost
- **SSH転送**: http://localhost:8080 (転送後)
