# InterroGame Frontend

## 概要
「犯人を導けワトソン！」の推理ゲームフロントエンド部分です。
React + TypeScript + Viteで構築されています。

## 機能
- 🏠 **ホームページ**: ゲーム説明とナビゲーション
- 🎮 **ゲーム画面**: 容疑者への質問と推理機能
- 🎯 **結果画面**: 推理結果の表示と解説
- 👤 **プロフィール**: 個人成績と履歴表示
- ⚙️ **管理者画面**: 事件テンプレートの作成・管理

## セットアップ

### 依存関係のインストール
```bash
npm install
```

### 開発サーバーの起動
```bash
npm run dev
```
アプリケーションは http://localhost:5173 で起動します。

### ビルド
```bash
npm run build
```

### プレビュー
```bash
npm run preview
```

## プロジェクト構成

```
src/
├── pages/           # ページコンポーネント
│   ├── HomePage.tsx     # ホーム画面
│   ├── GamePage.tsx     # ゲーム画面
│   ├── ResultPage.tsx   # 結果画面
│   ├── ProfilePage.tsx  # プロフィール画面
│   └── AdminPage.tsx    # 管理者画面
├── assets/          # 静的ファイル
├── App.tsx          # メインアプリコンポーネント
├── App.css          # スタイルシート
└── main.tsx         # エントリーポイント
```

## 使用技術
- **React 18**: UIライブラリ
- **TypeScript**: 型安全な開発
- **Vite**: 高速ビルドツール
- **React Router**: ルーティング
- **ESLint**: コード品質チェック

## API連携
バックエンド（Python + FastAPI）との連携は今後実装予定です。
現在はモックデータを使用しています。

## 開発時の注意事項
- TypeScriptの型チェックを有効にしています
- ESLintルールに従ってコードを記述してください
- レスポンシブデザインに対応しています

## 今後の実装予定
- [ ] バックエンドAPI連携
- [ ] リアルタイム機能（WebSocket）
- [ ] PWA対応
- [ ] テスト実装
    ...reactDom.configs.recommended.rules,
  },
})
```
