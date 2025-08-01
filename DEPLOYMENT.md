# 🎮 InterroGame リモートサーバー デプロイメント手順書

## 📋 概要
この手順書では、GPU搭載のリモートサーバーにInterroGameをDockerでデプロイし、ローカルPCからSSHポートフォワーディングでアクセスする方法を説明します。

## 🛠️ 前提条件

### リモートサーバー側
- Ubuntu 20.04 LTS以上
- Docker CE
- NVIDIA GPU + NVIDIA Docker Runtime（推奨）
- 最低8GB RAM、20GB以上の空きディスク容量
- SSH接続が可能

### ローカルPC側
- SSH クライアント
- Webブラウザ
## 🚀 セットアップ手順

### 1. リモートサーバーの準備

#### 1.1 必要なソフトウェアのインストール

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

#### 2.2 環境設定
```bash
# 環境変数ファイルをコピー
cp .env.example .env

# 必要に応じて環境変数を編集
nano .env
```

#### 2.3 デプロイ実行
```bash
# デプロイスクリプトに実行権限を付与
chmod +x deploy.sh

# デプロイ実行
./deploy.sh
```

#### 2.4 デプロイ状況の確認
```bash
# コンテナの状況確認
docker ps

# ログの確認
./logs.sh

# 特定のコンテナのログ確認
docker logs -f interrogame-backend
docker logs -f interrogame-frontend
```

### 3. ローカルからのアクセス設定

#### 3.1 SSHポートフォワーディングの設定

**方法1: コマンドラインでの接続**
```bash
# ローカルPCで実行
ssh -L 8080:localhost:8080 -L 8001:localhost:8000 user@remote-server-ip

# 説明:
# -L 8080:localhost:8080 : リモートの8080番ポート（フロントエンド）をローカルの8080番にフォワード
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
    LocalForward 8080 localhost:8080
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
### 4. 運用・管理

#### 4.1 ログの確認
```bash
# リアルタイムログ
./logs.sh

# 特定コンテナのログ
docker logs -f interrogame-backend
docker logs -f interrogame-frontend
```

#### 4.2 コンテナの再起動
```bash
# 全コンテナ再起動
docker restart interrogame-backend interrogame-frontend

# 特定コンテナの再起動
docker restart interrogame-backend
docker restart interrogame-frontend
```

#### 4.3 アップデート
```bash
# 最新のコードを取得
git pull origin main

# 再デプロイ
./deploy.sh
```

#### 4.4 完全停止
```bash
# コンテナ停止・削除
./stop.sh

# データも含めて完全削除（注意）
./cleanup.sh
```

## 🔧 トラブルシューティング

### よくある問題と解決方法

#### 1. GPU が認識されない
```bash
# GPU状況確認
nvidia-smi

# Docker内でGPU確認
docker run --rm --gpus all nvidia/cuda:11.0-base nvidia-smi
```

#### 2. メモリ不足エラー
```bash
# メモリ使用量確認
free -h
docker stats

# 不要なイメージ・コンテナの削除
docker system prune -a
```

#### 3. ポートが使用中
```bash
# ポート使用状況確認
sudo netstat -tulpn | grep :8080
sudo netstat -tulpn | grep :8000

# プロセス終了
sudo kill -9 PID
```

#### 4. Ollamaモデルのダウンロードが失敗
```bash
# 手動でモデルをダウンロード
docker exec interrogame-backend ollama pull qwen3:8b

# 利用可能なモデル確認
docker exec interrogame-backend ollama list
```

#### 5. フロントエンドがバックエンドに接続できない
```bash
# ネットワーク確認
docker network ls
docker network inspect interrogame-network

# バックエンドのヘルスチェック
curl http://localhost:8000/v1/api/health
```

## 📚 補足情報

### セキュリティ考慮事項
- 本番環境では適切なファイアウォール設定を行う
- SSH鍵認証の使用を推奨
- 定期的なシステムアップデートを実施

### パフォーマンス最適化
- GPUメモリが不足する場合は、より小さなモデルを使用
- 同時アクセス数が多い場合は、複数インスタンスの起動を検討

### バックアップ
```bash
# Ollamaデータのバックアップ
docker run --rm -v interrogame-ollama-data:/source -v $(pwd):/backup alpine tar czf /backup/ollama-backup.tar.gz -C /source .

# 復元
docker run --rm -v interrogame-ollama-data:/target -v $(pwd):/backup alpine tar xzf /backup/ollama-backup.tar.gz -C /target
```

## 🎯 アクセス先まとめ

- **ゲーム**: http://localhost:8080
- **API確認**: http://localhost:8001/v1/api/health
- **SSH接続**: `ssh -L 8080:localhost:8080 -L 8001:localhost:8000 user@server-ip`

## 📞 サポート

問題が発生した場合は、以下の情報を含めて報告してください：
- エラーメッセージ
- `./logs.sh` の出力
- システム情報（`uname -a`, `docker --version`）

---

⚡ このガイドにより、リモートのGPU搭載サーバーでInterroGameを実行し、ローカルPCのブラウザからSSHトンネル経由で安全にアクセスできます。
