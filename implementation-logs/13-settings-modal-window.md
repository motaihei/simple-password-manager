# 設定ウィンドウのモーダル化

## 実装日時
2025-06-25

## 実装した機能
設定ウィンドウを独立したウィンドウからモーダルウィンドウに変更しました。

## 変更したファイル
- `main.js` - 設定ウィンドウをモーダルウィンドウとして設定
- `settings.html` - モーダルウィンドウに適したスタイル調整

## 主要な決定事項

### ウィンドウ動作の変更
1. **モーダルウィンドウ化**: `modal: true`と`parent: mainWindow`を設定
2. **中央配置**: `center: true`でメインウィンドウの中央に表示
3. **表示制御**: `show: false`と`ready-to-show`イベントでちらつきを防止

### ユーザビリティの向上
1. **フォーカス制御**: モーダルウィンドウが開いている間はメインウィンドウの操作を制限
2. **適切なサイズ**: 350px高さに調整してコンパクトな設定画面を実現
3. **親子関係**: メインウィンドウが閉じられると設定ウィンドウも自動的に閉じる

## 技術的実装内容

### 1. メインウィンドウインスタンスの管理
```javascript
let mainWindow = null;
let settingsWindow = null;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    // 既存の設定...
  });
  // ...
};
```

### 2. モーダルウィンドウの設定
```javascript
const createSettingsWindow = () => {
  if (settingsWindow) {
    settingsWindow.focus();
    return;
  }

  settingsWindow = new BrowserWindow({
    width: 500,
    height: 350,
    resizable: false,
    modal: true,           // モーダルウィンドウとして設定
    parent: mainWindow,    // 親ウィンドウを指定
    center: true,          // 中央配置
    show: false,           // 初期状態では非表示
    icon: path.join(__dirname, 'assets', 'icons', 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false
    }
  });

  settingsWindow.loadFile('settings.html');
  
  // ウィンドウが準備完了後に表示
  settingsWindow.once('ready-to-show', () => {
    settingsWindow.show();
  });
  
  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });
};
```

### 3. スタイル調整
```css
.container {
    max-width: 500px;
    margin: 0 auto;
    background-color: white;
    padding: 25px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    height: calc(100vh - 50px);
    overflow-y: auto;
}
```

## 改善された動作

### Before（独立ウィンドウ）
- メインウィンドウと同時に操作可能
- タスクバーに別アイコンとして表示
- ウィンドウの位置が任意の場所に表示

### After（モーダルウィンドウ）
- 設定ウィンドウが開いている間はメインウィンドウの操作が制限される
- メインウィンドウの中央に表示される
- メインウィンドウを閉じると設定ウィンドウも自動的に閉じる
- より直感的で一般的なアプリケーション動作

## 期待される効果
1. **ユーザビリティの向上**: 設定画面らしい直感的な動作
2. **フォーカス管理**: 設定中に他の操作で混乱することを防止
3. **視覚的な関連性**: 親子関係が明確で設定の対象が分かりやすい
4. **メモリ効率**: 不要なウィンドウインスタンスの削減