# 実装ログ 05: パスワード保存場所エクスプローラー開く機能

## 実装日時
2025-06-25

## 実装した機能
メイン画面にパスワード保存場所をシステムのエクスプローラーで開くボタンを追加

## 変更/作成したファイル

### 1. main.js
- Electronの`shell`モジュールをインポートに追加
- `open-password-folder`ハンドラーを実装
- `app.getPath('userData')`で取得したユーザーデータフォルダーを`shell.openPath()`で開く機能

```javascript
// パスワードファイル保存場所をエクスプローラーで開く
ipcMain.handle('open-password-folder', async () => {
  try {
    const userDataPath = app.getPath('userData');
    await shell.openPath(userDataPath);
    return { success: true };
  } catch (error) {
    console.error('Error opening folder:', error);
    return { success: false, error: error.message };
  }
});
```

### 2. preload.js
- `openPasswordFolder`APIをレンダラープロセスに公開
- セキュリティを保ちながらメインプロセスとの通信を可能にする

```javascript
// フォルダーを開くAPI
openPasswordFolder: () => ipcRenderer.invoke('open-password-folder'),
```

### 3. index.html
- 「📂 保存場所を開く」ボタンを追加
- 既存の「新規パスワード追加」ボタンと並べて配置
- `.action-container`にgapスタイルを追加してボタン間隔を調整

```html
<div class="action-container">
    <button class="btn btn-secondary" id="openFolderBtn">📂 保存場所を開く</button>
    <button class="btn btn-primary" id="addBtn">+ 新規パスワード追加</button>
</div>
```

### 4. renderer.js
- `openFolderBtn`要素の取得を追加
- ボタンクリック時のイベントリスナーを実装
- エラーハンドリングを含む

```javascript
// フォルダーを開くボタンのイベントリスナー
openFolderBtn.addEventListener('click', async () => {
    try {
        const result = await window.electronAPI.openPasswordFolder();
        if (!result.success) {
            console.error('フォルダーを開けませんでした:', result.error);
        }
    } catch (error) {
        console.error('エラーが発生しました:', error);
    }
});
```

## 主要な決定事項

1. **ボタンの配置**: 検索ボックスの下、既存の「新規パスワード追加」ボタンの左に配置
2. **アイコン選択**: 📂（フォルダー）アイコンを使用して機能を視覚的に表現
3. **ボタンスタイル**: セカンダリースタイル（グレー）を使用してプライマリー機能と区別
4. **エラーハンドリング**: フォルダーを開けない場合はコンソールにエラーログを出力

## 遭遇した問題と解決策

### 問題1: ボタン間隔の調整
既存の`.action-container`ではボタンが隣接して配置されるため、間隔が不足していた。

**解決策**: CSSにgap: 10pxを追加してボタン間の適切な間隔を確保

### 問題2: セキュリティ要件
レンダラープロセスからメインプロセスの機能に安全にアクセスする必要があった。

**解決策**: preload.jsのcontextBridgeを使用してセキュアなAPIを公開

## 技術的な実装内容

- **Electronセキュリティ**: contextIsolationとcontextBridgeによる安全なプロセス間通信
- **ファイルシステム**: `app.getPath('userData')`でプラットフォームに依存しない保存場所を取得
- **システム統合**: `shell.openPath()`でOSのデフォルトファイルマネージャーを起動
- **エラーハンドリング**: 非同期処理でのエラー捕捉と適切なレスポンス返却

## 動作確認内容

- ボタンが正しく表示されること
- ボタンクリックでパスワードファイル保存フォルダーが開くこと
- エラー時にコンソールに適切なエラーメッセージが出力されること

この機能により、ユーザーはパスワードファイルの保存場所を簡単に確認できるようになり、必要に応じてバックアップや他のファイル操作を行うことが可能になった。