# InterroGame 🕵️‍♂️

推理ゲーム「犯人を導けワトソン！」のWebアプリケーションです。

## 🎮 ゲーム概要

ワトソン（プレイヤー）が殺人事件の現場で3人の容疑者に質問し、証言の矛盾を見抜いて真犯人を特定する推理ゲームです。

### 🎯 ゲームの流れ
1. 現場情報（事件の状況）が提示される
2. 3人の容疑者に質問（回数制限あり）
3. 証言を分析し、矛盾点を発見
4. 真犯人を特定してクリア！

## 🏗️ システム構成

```
InterroGame/
├── frontend/           # React + TypeScript + Vite
│   ├── src/
│   │   ├── pages/     # ページコンポーネント
│   │   ├── assets/    # 静的ファイル
│   │   └── ...
│   └── ...
├── backend/           # Python + FastAPI
│   ├── main.py       # メインAPIサーバー
│   └── requirements.txt
├── SPEC.md           # 詳細仕様書
└── README.md         # このファイル
```

## 🚀 クイックスタート

### フロントエンド（React）
```bash
cd frontend
npm install
npm run dev
```
→ http://localhost:5173 でアクセス

### バックエンド（FastAPI）
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```
→ http://localhost:8000 でAPIサーバー起動

### 開発用タスク実行
VS Codeのタスク機能を使用：
- `frontend: dev` - フロントエンド開発サーバー
- `backend: dev` - バックエンド開発サーバー

## 📱 主な機能

### ✅ 実装済み（フロントエンド）
- 🏠 **ホームページ**: ゲーム説明とナビゲーション
- 🎮 **ゲーム画面**: 容疑者選択、質問入力、証言表示
- 🎯 **結果画面**: 推理結果の判定と解説
- 👤 **プロフィール**: 個人成績・履歴・実績
- ⚙️ **管理者画面**: 事件テンプレート作成・管理

### 🔄 実装予定
- [ ] バックエンドAPI連携
- [ ] LLM連携（容疑者の自動回答）
- [ ] ユーザー認証システム
- [ ] データベース連携
- [ ] リアルタイム機能

## 🛠️ 技術スタック

| 分野 | 技術 |
|------|------|
| フロントエンド | React 18, TypeScript, Vite, React Router |
| バックエンド | Python, FastAPI |
| スタイリング | CSS3, Responsive Design |
| 開発環境 | VS Code, ESLint |

## 📖 詳細仕様

詳細なゲーム仕様については [SPEC.md](./SPEC.md) をご確認ください。

## 🤝 開発ガイドライン

### コーディング規約
- フロントエンド：TypeScript + ESLint
- バックエンド：Python + FastAPI
- 各ディレクトリの責務を明確に分ける
- API設計や仕様はREADMEに記載・更新
- コード例やテストも積極的に記述

### ディレクトリ構成
- `frontend/` - React アプリケーション
- `backend/` - FastAPI サーバー
- `.vscode/` - VS Code 設定（タスク等）

## 🎨 デザイン特徴

- 推理ゲームにふさわしいミステリアスなテーマ
- 直感的なユーザーインターフェース
- レスポンシブデザイン対応
- アクセシブルな色使いとコントラスト

## 📝 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

---

⚡ 開発中のプロジェクトです。機能追加や改善提案は随時募集中！
