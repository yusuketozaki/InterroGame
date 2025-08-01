# 🚀 InterroGame クイックスタート

## 1分でできる！ローカル開発環境セットアップ

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

### アクセス先
- ゲーム: http://localhost
- API: http://localhost:8000/v1/api/health

## リモートサーバーへのデプロイ

### SSH接続でのアクセス
```bash
# SSH ポートフォワーディング
ssh -L 8080:localhost:80 -L 8001:localhost:8000 user@server-ip

# ブラウザでアクセス
# http://localhost:8080
```

### 詳細な手順
- [DEPLOYMENT.md](./DEPLOYMENT.md) を参照

## トラブル時
```bash
# ログ確認
docker-compose logs -f

# 再起動
docker-compose restart

# 完全リセット
docker-compose down
./deploy.sh
```
