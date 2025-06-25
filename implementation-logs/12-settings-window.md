# 設定ウィンドウ機能の実装

## 実装日時
2025-06-25

## 実装した機能
設定ウィンドウを作成し、「保存場所を開く」ボタンを設置しました。

## 変更/作成したファイル

### 新規作成
- `settings.html` - 設定ウィンドウのHTMLファイル

### 変更したファイル
- `main.js` - 設定ウィンドウ作成機能とIPCハンドラーを追加
- `preload.js` - 設定ウィンドウ関連のAPIを追加
- `index.html` - 「保存場所を開く」ボタンを「設定」ボタンに変更
- `renderer.js` - 設定ボタンのイベントリスナーを実装

## 主要な決定事項

### アーキテクチャ設計
1. **独立した設定ウィンドウ**: メインウィンドウとは別の専用ウィンドウとして実装
2. **モーダルダイアログではなく通常ウィンドウ**: リサイズ不可、固定サイズ（500x400）
3. **同一プリロードスクリプト使用**: preload.jsを共通使用してコードの一貫性を保持

### UI/UX設計
1. **ダークモード対応**: メインウィンドウの設定を自動的に同期
2. **機能の再配置**: メインウィンドウの「保存場所を開く」ボタンを設定ウィンドウに移動
3. **アクセシビリティ**: 設定ボタンには分かりやすい歯車アイコン（⚙️）を使用

### セキュリティ考慮
1. **コンテキスト分離維持**: 設定ウィンドウでも同じセキュリティ設定を適用
2. **IPCセキュリティ**: 設定ウィンドウ専用のIPCハンドラーを追加

## 技術的実装内容

### 1. 設定ウィンドウの作成（settings.html）
```html
<!-- ファイル管理セクション -->
<div class="setting-section">
    <h2>📂 ファイル管理</h2>
    <div class="setting-item">
        <label class="setting-label">パスワードファイルの保存場所</label>
        <div class="setting-description">
            パスワードデータが保存されているフォルダーをエクスプローラーで開きます。
        </div>
        <button class="btn btn-primary" id="openFolderBtn">📂 保存場所を開く</button>
    </div>
</div>
```

### 2. メインプロセスの拡張（main.js）
```javascript
let settingsWindow = null;

const createSettingsWindow = () => {
  if (settingsWindow) {
    settingsWindow.focus();
    return;
  }

  settingsWindow = new BrowserWindow({
    width: 500,
    height: 400,
    resizable: false,
    icon: path.join(__dirname, 'assets', 'icons', 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false
    }
  });

  settingsWindow.loadFile('settings.html');
  
  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });
};

// IPCハンドラー
ipcMain.handle('open-settings', () => {
  createSettingsWindow();
  return { success: true };
});

ipcMain.handle('close-settings', () => {
  if (settingsWindow) {
    settingsWindow.close();
  }
  return { success: true };
});
```

### 3. プリロードスクリプトの拡張（preload.js）
```javascript
contextBridge.exposeInMainWorld('electronAPI', {
  // 既存API...
  
  // 設定ウィンドウAPI
  openSettingsWindow: () => ipcRenderer.invoke('open-settings'),
  closeSettingsWindow: () => ipcRenderer.invoke('close-settings'),
});
```

### 4. メインウィンドウの更新（index.html & renderer.js）
- 「保存場所を開く」ボタンを「設定」ボタンに変更
- 設定ボタンのイベントリスナーを実装

## 遭遇した問題と解決策

### 問題1: ウィンドウの重複起動
**問題**: 設定ボタンを複数回クリックすると複数の設定ウィンドウが開く

**解決策**: `settingsWindow`変数でウィンドウの状態を管理し、既に開いている場合はフォーカスするだけに制限

### 問題2: ダークモード設定の同期
**問題**: 設定ウィンドウでダークモード設定が反映されない

**解決策**: 設定ウィンドウの初期化時にlocalStorageからダークモード設定を読み込んで適用

### 問題3: renderer.jsファイルの変数名衝突
**問題**: 既存の`openFolderBtn`変数と新しい`settingsBtn`変数が混在

**解決策**: 既存コードを適切に更新し、新しい設定ボタン用のイベントリスナーに置き換え

## 今後の拡張可能性
1. **追加設定項目**: パスワード生成設定、自動保存間隔など
2. **テーマカスタマイズ**: カラーテーマの選択機能
3. **バックアップ設定**: 自動バックアップ機能の設定
4. **言語設定**: 多言語対応の設定機能