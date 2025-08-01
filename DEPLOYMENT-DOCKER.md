# 🐳 InterroGame Docker単体デプロイメント手順書

## 📋 概要
Docker Composeが利用できないリモートサーバー環境での、InterroGameのデプロイメント手順です。
個別のDockerコンテナを使用してサービスを構築します。

## 🛠️ 前提条件

### リモートサーバー側
- Ubuntu 20.04 LTS以上
- Docker CE (最新版)
- NVIDIA GPU + NVIDIA Docker Runtime（推奨）
- 最低8GB RAM、20GB以上の空きディスク容量
- SSH接続が可能

### ローカルPC側
- SSH クライアント
- Webブラウザ

## 🚀 セットアップ手順

### 1. リモートサーバーの準備

#### 1.1 Dockerのインストール
```bash
# システムの更新
sudo apt update && sudo apt upgrade -y

# Dockerのインストール
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# NVIDIA Container Toolkit（GPU使用の場合）
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/libnvidia-container/gpgkey | sudo apt-key add -
curl -s -L https://nvidia.github.io/libnvidia-container/$distribution/libnvidia-container.list | sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list
sudo apt-get update && sudo apt-get install -y nvidia-docker2
sudo systemctl restart docker
```

#### 1.2 再ログインして設定を反映
```bash
# 一度ログアウトして再ログイン
exit
# 再接続後、Dockerが使えることを確認
docker --version
```

### 2. プロジェクトのデプロイ

#### 2.1 ソースコードの取得
```bash
# プロジェクトをクローン
git clone https://github.com/yusuketozaki/InterroGame.git
cd InterroGame

# または、ローカルからファイルを転送
# scp -r /path/to/InterroGame user@remote-server:~/
```

#### 2.2 デプロイ実行
```bash
# デプロイスクリプトに実行権限を付与
chmod +x deploy-docker.sh stop-docker.sh cleanup-docker.sh logs-docker.sh

# デプロイ実行
./deploy-docker.sh
```

#### 2.3 デプロイ状況の確認
```bash
# コンテナの状況確認
docker ps --filter name=interrogame

# ログの確認
./logs-docker.sh
```

### 3. ローカルからのアクセス設定

#### 3.1 SSHポートフォワーディングの設定

**方法1: コマンドラインでの接続**
```bash
# ローカルPCで実行
ssh -L 8080:localhost:80 -L 8001:localhost:8000 user@remote-server-ip

# 説明:
# -L 8080:localhost:80  : リモートの80番ポート（フロントエンド）をローカルの8080番にフォワード
# -L 8001:localhost:8000 : リモートの8000番ポート（バックエンド）をローカルの8001番にフォワード
```

**方法2: SSH設定ファイルを使用**
```bash
# ~/.ssh/config に以下を追加
nano ~/.ssh/config
```

```
Host interrogame
    HostName remote-server-ip
    User your-username
    LocalForward 8080 localhost:80
    LocalForward 8001 localhost:8000
```

その後、以下のコマンドで接続：
```bash
ssh interrogame
```

#### 3.2 ブラウザでのアクセス
SSH接続を維持したまま、ローカルPCのブラウザで以下にアクセス：
- **フロントエンド**: http://localhost:8080
- **バックエンドAPI**: http://localhost:8001/v1/api/health

## 🔧 運用・管理

### 4.1 基本的な管理コマンド

```bash
# サービス停止
./stop-docker.sh

# サービス再開
./deploy-docker.sh

# ログ確認（対話式）
./logs-docker.sh

# 完全削除（データも含む）
./cleanup-docker.sh
```

### 4.2 手動でのコンテナ操作

```bash
# コンテナ状態確認
docker ps --filter name=interrogame

# 個別コンテナの再起動
docker restart interrogame-backend
docker restart interrogame-frontend

# コンテナ内でのコマンド実行
docker exec -it interrogame-backend bash
docker exec -it interrogame-frontend sh

# リソース使用量確認
docker stats interrogame-backend interrogame-frontend
```

### 4.3 ネットワーク・ボリューム管理

```bash
# ネットワーク確認
docker network ls
docker network inspect interrogame-network

# ボリューム確認
docker volume ls
docker volume inspect interrogame-ollama-data

# ボリュームのバックアップ
docker run --rm -v interrogame-ollama-data:/source -v $(pwd):/backup alpine tar czf /backup/ollama-backup.tar.gz -C /source .
```

## 🔧 トラブルシューティング

### よくある問題と解決方法

#### 1. コンテナが起動しない
```bash
# コンテナのログを確認
docker logs interrogame-backend
docker logs interrogame-frontend

# ポートの競合確認
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :8000

# 既存プロセスの停止
sudo lsof -ti:80 | xargs kill -9
sudo lsof -ti:8000 | xargs kill -9
```

#### 2. GPU が認識されない
```bash
# GPU状況確認
nvidia-smi

# Docker内でGPU確認
docker run --rm --gpus all nvidia/cuda:11.0-base nvidia-smi

# コンテナでGPU使用状況確認
docker exec -it interrogame-backend nvidia-smi
```

#### 3. ネットワーク接続の問題
```bash
# ネットワークの再作成
docker network rm interrogame-network
docker network create interrogame-network

# DNS確認
docker exec -it interrogame-frontend nslookup interrogame-backend
```

#### 4. Ollamaモデルの問題
```bash
# モデルの手動ダウンロード
docker exec -it interrogame-backend ollama pull qwen2.5:7b

# 利用可能なモデル確認
docker exec -it interrogame-backend ollama list

# Ollamaサービスの再起動
docker exec -it interrogame-backend pkill ollama
docker restart interrogame-backend
```

#### 5. メモリ不足
```bash
# メモリ使用量確認
free -h
docker stats

# 不要なリソースの削除
docker system prune -a
docker volume prune
```

## 📚 高度な設定

### カスタムポート設定
デプロイスクリプトを編集してポートを変更する場合：

```bash
# deploy-docker.sh の該当行を編集
-p 8080:80 \  # フロントエンドを8080ポートで公開
-p 8001:8000 \ # バックエンドを8001ポートで公開
```

### 環境変数の設定
```bash
# バックエンドコンテナに環境変数を追加
docker run -d \
  --name interrogame-backend \
  -e CUSTOM_VAR=value \
  -e OLLAMA_HOST=0.0.0.0:11434 \
  # ... 他のオプション
```

### SSL/TLS設定（本番環境）
```bash
# リバースプロキシとしてNginxを使用
docker run -d \
  --name nginx-proxy \
  -p 443:443 \
  -p 80:80 \
  -v /path/to/certs:/etc/nginx/certs \
  nginx
```

## 🎯 パフォーマンス最適化

### リソース制限の設定
```bash
# メモリ制限付きでコンテナを起動
docker run -d \
  --name interrogame-backend \
  --memory="4g" \
  --cpus="2" \
  # ... 他のオプション
```

### ログローテーション
```bash
# ログサイズの制限
docker run -d \
  --name interrogame-backend \
  --log-opt max-size=100m \
  --log-opt max-file=3 \
  # ... 他のオプション
```

## 🎯 アクセス先まとめ

- **ゲーム**: http://localhost:8080
- **API確認**: http://localhost:8001/v1/api/health
- **SSH接続**: `ssh -L 8080:localhost:80 -L 8001:localhost:8000 user@server-ip`

## 📞 サポート

問題が発生した場合は、以下のコマンドで情報を収集してください：

```bash
# システム情報
uname -a
docker --version

# コンテナ状態
docker ps -a

# ログ情報
./logs-docker.sh

# リソース使用量
docker stats --no-stream
```
