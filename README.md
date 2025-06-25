# パスワード管理アプリ

シンプルで使いやすいElectronベースのパスワード管理アプリケーションです。

## 機能

- **パスワード管理**: エントリ名、ユーザー名、パスワードを保存・管理
- **CRUD操作**: エントリの追加、編集、削除が可能
- **パスワード生成**: 16文字の安全なランダムパスワードを自動生成
- **個別更新**: 各エントリのパスワードをワンクリックで更新
- **クリップボードコピー**: パスワードをワンクリックでクリップボードにコピー
- **検索機能**: エントリ名でリアルタイム検索
- **表示/非表示**: パスワードの表示切り替え機能

## 技術スタック

- **Electron**: デスクトップアプリケーションフレームワーク
- **Node.js**: JavaScriptランタイム
- **ES6+ Modules**: モジュールシステム（import/export）
- **CSS3**: レスポンシブデザイン・ダークモード対応
- **Jest**: テストフレームワーク

## インストール

```bash
# リポジトリのクローン
git clone [repository-url]
cd 20250625_0152

# 依存関係のインストール
npm install
```

## 使用方法

```bash
# アプリケーションの起動
npm start
```

## テスト

```bash
# テストの実行
npm test

# カバレッジ付きでテストを実行
npm test -- --coverage
```

## プロジェクト構造

```
20250625_0152/
├── main.js                 # メインプロセス
├── preload.js             # プリロードスクリプト
├── index.html             # UI（軽量化済み）
├── src/                   # ソースコード
│   └── assets/
│       ├── css/           # スタイルシート
│       │   ├── base.css          # 基本レイアウト・共通スタイル
│       │   ├── components.css    # ボタン・フォーム等コンポーネント
│       │   ├── table.css         # テーブル表示スタイル
│       │   ├── modal.css         # モーダルウィンドウスタイル
│       │   ├── tooltip.css       # ツールチップスタイル
│       │   └── themes.css        # ダークモードテーマ
│       └── js/            # JavaScript
│           ├── app.js            # メインアプリケーション
│           ├── utils/            # ユーティリティ関数
│           │   ├── dom.js        # DOM操作・フォーマット
│           │   ├── password.js   # パスワード生成・管理
│           │   └── storage.js    # データ保存・読み込み
│           └── components/       # UIコンポーネント
│               ├── modal.js      # モーダル管理クラス
│               ├── table.js      # テーブル表示クラス
│               ├── theme.js      # テーマ切り替えクラス
│               └── search.js     # 検索機能クラス
├── package.json           # プロジェクト設定
├── jest.config.js         # Jest設定
├── jest.setup.js          # テストセットアップ
├── __tests__/             # テストファイル
│   ├── unit/             # 単体テスト
│   └── integration/      # 統合テスト
├── implementation-logs/   # 実装ログ
└── CLAUDE.md             # 開発ガイドライン
```

## セキュリティ

- Context Isolationを有効化
- Node Integrationを無効化
- プリロードスクリプト経由でのセキュアなAPI通信
- XSS対策のためのHTMLエスケープ処理

## データ保存

パスワードデータは以下の場所にJSONファイルとして保存されます：
- Windows: `%APPDATA%/20250625_0152/passwords.json`
- macOS: `~/Library/Application Support/20250625_0152/passwords.json`
- Linux: `~/.config/20250625_0152/passwords.json`

**注意**: 現在のバージョンではパスワードは平文で保存されます。本番環境での使用には暗号化の実装を推奨します。

## 開発

### 実装ログ

開発時は `implementation-logs/` ディレクトリに実装ログを記録してください。詳細は `CLAUDE.md` を参照。

### コード構成

#### モジュール化アーキテクチャ
- **責務分離**: 機能ごとにファイルを分割
- **ES6 Modules**: import/exportによるモジュール管理
- **クラスベース**: UIコンポーネントはクラスで実装

#### ファイル構成
- **CSS**: 機能別に6ファイルに分割（base, components, table, modal, tooltip, themes）
- **JavaScript**: 責務別に8ファイルに分割
  - `app.js`: メインアプリケーション制御
  - `utils/`: 汎用機能（DOM操作、パスワード生成、ストレージ）
  - `components/`: UIコンポーネント（モーダル、テーブル、テーマ、検索）

### コード規約

- ES6+の構文を使用
- モジュール化とクラスベース設計
- セキュリティベストプラクティスに従う
- テストを書く

## ライセンス

ISC

## 作成日

2025-06-25 01:52
