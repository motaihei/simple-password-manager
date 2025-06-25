# Electronメニューバーの非表示化

## 実装日時
2025-06-25

## 実装した機能
ElectronのデフォルトメニューバーとApplication Menuを完全に非表示にしました。

## 変更したファイル
- `main.js` - メニューバーとアプリケーションメニューを無効化

## 主要な決定事項

### メニュー非表示化の手法
1. **ウィンドウレベルでの非表示**: `autoHideMenuBar: true`を各ウィンドウに設定
2. **アプリケーションレベルでの無効化**: `Menu.setApplicationMenu(null)`でメニュー自体を削除
3. **統一性の確保**: メインウィンドウと設定ウィンドウの両方に適用

### UI/UX設計の考慮
1. **クリーンなインターフェース**: 不要なElectronのメニューを削除してアプリ固有のUIに集中
2. **Windowsアプリらしい外観**: デスクトップアプリケーションとしての統一感を向上
3. **フォーカスの向上**: メインコンテンツに集中できる環境を提供

## 技術的実装内容

### 1. Menuモジュールのインポート
```javascript
const { app, BrowserWindow, ipcMain, shell, Menu } = require('electron');
```

### 2. メインウィンドウのメニューバー非表示
```javascript
mainWindow = new BrowserWindow({
  width: 600,
  height: 1067,
  icon: path.join(__dirname, 'assets', 'icons', 'icon.ico'),
  autoHideMenuBar: true,  // メニューバーを自動的に隠す
  webPreferences: {
    // 既存の設定...
  }
});
```

### 3. 設定ウィンドウのメニューバー非表示
```javascript
settingsWindow = new BrowserWindow({
  width: 500,
  height: 350,
  resizable: false,
  modal: true,
  parent: mainWindow,
  center: true,
  show: false,
  autoHideMenuBar: true,  // メニューバーを自動的に隠す
  icon: path.join(__dirname, 'assets', 'icons', 'icon.ico'),
  webPreferences: {
    // 既存の設定...
  }
});
```

### 4. アプリケーションメニューの完全無効化
```javascript
app.whenReady().then(() => {
  // アプリケーションメニューを無効化
  Menu.setApplicationMenu(null);
  
  createWindow();
  
  // 既存の処理...
});
```

## 実装による効果

### Before（メニューあり）
- ElectronのデフォルトメニューバーがFile, Edit, View, Windowなどで表示
- アプリケーションの上部に不要なスペースを占有
- デベロッパー向けの機能が露出

### After（メニューなし）
- クリーンで統一されたインターフェース
- アプリケーション固有のUIに集中
- より洗練されたデスクトップアプリケーションの外観

## セキュリティとアクセシビリティの考慮

### セキュリティ
- デベロッパーツールへのアクセスを制限（Alt+Ctrl+Iなどは別途対応が必要な場合）
- 不要な機能の露出を防止

### アクセシビリティ
- キーボードショートカットによる操作は必要に応じて別途実装を検討
- 現在のパスワード管理アプリでは主にマウス操作なので大きな影響なし

## 注意点
- 開発時のデベロッガーアクセスが制限される場合は、開発モードでのみメニューを表示する条件分岐を検討
- macOSでは完全にメニューを非表示にできない場合があるが、現在はWindows主体の開発なので影響なし

## 今後の改善案
1. **開発環境での条件分岐**: NODE_ENVに基づいてメニュー表示を切り替え
2. **カスタムメニュー**: 必要に応じて最小限のカスタムメニューを実装
3. **キーボードショートカット**: 重要な機能についてはキーボードショートカットで対応