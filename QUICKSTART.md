# 🚀 InterroGame クイックスタート

## 🐳 Docker Compose版（推奨）

### 必要なもの
- Docker & Docker Compose
- Git

### 手順
```bash
# 1. プロジェクトをクローン
git clone https://github.com/yusuketozaki/InterroGame.git
cd InterroGame

# 2. 環境変数を設定
cp .env.example .env

# 3. デプロイ実行
chmod +x deploy.sh
./deploy.sh
```

## 🐳 Docker単体版（Docker Composeが使えない環境）

### 必要なもの
- Docker CE
- Git

### 手順
```bash
# 1. プロジェクトをクローン
git clone https://github.com/yusuketozaki/InterroGame.git
cd InterroGame

# 2. デプロイ実行
chmod +x deploy-docker.sh
./deploy-docker.sh
```

### 管理コマンド
```bash
# 停止
./stop-docker.sh

# ログ確認
./logs-docker.sh

# 完全削除
./cleanup-docker.sh
```

### アクセス先
- ゲーム: http://localhost
- API: http://localhost:8000/v1/api/health

## 🌐 リモートサーバーへのデプロイ

### SSH接続でのアクセス
```bash
# SSH ポートフォワーディング
ssh -L 8080:localhost:80 -L 8001:localhost:8000 user@server-ip

# ブラウザでアクセス
# http://localhost:8080
```

### 詳細な手順
- **Docker Compose版**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Docker単体版**: [DEPLOYMENT-DOCKER.md](./DEPLOYMENT-DOCKER.md)

## 🔧 トラブル時
```bash
# ログ確認
docker-compose logs -f  # Compose版
./logs-docker.sh        # 単体版

# 再起動
docker-compose restart  # Compose版
./deploy-docker.sh      # 単体版

# 完全リセット
docker-compose down && ./deploy.sh  # Compose版
./cleanup-docker.sh && ./deploy-docker.sh  # 単体版
```
