const { app, BrowserWindow, ipcMain, shell, Menu } = require('electron');
const path = require('path');
const fs = require('fs').promises;

let mainWindow = null;

const createWindow = () => {
  // 開発モードかどうかで初期サイズを調整
  const isDev = !app.isPackaged;
  const windowConfig = {
    width: isDev ? 1200 : 600,  // 開発時は横幅を倍に
    height: 1067,
    minWidth: 480,
    minHeight: 600,
    icon: path.join(__dirname, 'assets', 'icons', 'icon.ico'), // Windowsアイコン
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false
    }
  };

  mainWindow = new BrowserWindow(windowConfig);

  mainWindow.loadFile('index.html');
  
  // 開発時のみ開発者ツールを表示
  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'right' }); // 右側にドッキング
  }
};


app.whenReady().then(async () => {
  // アプリケーションメニューを無効化
  Menu.setApplicationMenu(null);
  
  createWindow();
  
  // アプリ起動時に設定を初期化
  await initializeSettings();
  
  // IPCハンドラー登録の確認ログ
  console.log('IPCハンドラーが登録されました: load-passwords, save-passwords, open-password-folder, open-url, load-settings, save-settings, select-storage-folder');

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ファイル操作API
const SETTINGS_FILE = path.join(app.getPath('userData'), 'settings.json');
let PASSWORD_FILE = path.join(app.getPath('userData'), 'passwords.json');

// 設定の読み込み
const loadSettings = async () => {
  try {
    const data = await fs.readFile(SETTINGS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return { storageLocation: app.getPath('userData') };
    }
    throw error;
  }
};

// 設定の保存
const saveSettings = async (settings) => {
  try {
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2));
    return { success: true };
  } catch (error) {
    console.error('Error saving settings:', error);
    return { success: false, error: error.message };
  }
};

// アプリ起動時に設定を読み込み、パスワードファイルのパスを更新
const initializeSettings = async () => {
  const settings = await loadSettings();
  PASSWORD_FILE = path.join(settings.storageLocation, 'passwords.json');
  return settings;
};

// パスワードデータの読み込み
ipcMain.handle('load-passwords', async () => {
  try {
    // 最新の設定に基づいてパスワードファイルのパスを更新
    const settings = await loadSettings();
    PASSWORD_FILE = path.join(settings.storageLocation, 'passwords.json');
    
    const data = await fs.readFile(PASSWORD_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // ファイルが存在しない場合は空の配列を返す
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
});

// パスワードデータの保存
ipcMain.handle('save-passwords', async (event, passwords) => {
  try {
    // 最新の設定に基づいてパスワードファイルのパスを更新
    const settings = await loadSettings();
    PASSWORD_FILE = path.join(settings.storageLocation, 'passwords.json');
    
    // ディレクトリが存在しない場合は作成
    const dir = path.dirname(PASSWORD_FILE);
    await fs.mkdir(dir, { recursive: true });
    
    await fs.writeFile(PASSWORD_FILE, JSON.stringify(passwords, null, 2));
    return { success: true };
  } catch (error) {
    console.error('Error saving passwords:', error);
    return { success: false, error: error.message };
  }
});

// パスワードファイル保存場所をエクスプローラーで開く
ipcMain.handle('open-password-folder', async () => {
  console.log('open-password-folder ハンドラーが呼び出されました');
  try {
    const settings = await loadSettings();
    const folderPath = settings.storageLocation;
    console.log('フォルダーパス:', folderPath);
    await shell.openPath(folderPath);
    console.log('フォルダーを正常に開きました');
    return { success: true };
  } catch (error) {
    console.error('Error opening folder:', error);
    return { success: false, error: error.message };
  }
});

// URLをデフォルトブラウザで開く
ipcMain.handle('open-url', async (event, url) => {
  console.log('open-url ハンドラーが呼び出されました:', url);
  try {
    await shell.openExternal(url);
    console.log('URLを正常に開きました:', url);
    return { success: true };
  } catch (error) {
    console.error('Error opening URL:', error);
    return { success: false, error: error.message };
  }
});

// ウィンドウサイズを標準サイズにリセット
ipcMain.handle('reset-window-size', async () => {
  console.log('reset-window-size ハンドラーが呼び出されました');
  try {
    if (mainWindow) {
      // 最大化状態を解除
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      }
      // 標準サイズ（600x1067）にリセット
      mainWindow.setSize(600, 1067);
      // ウィンドウを画面中央に移動
      mainWindow.center();
      console.log('ウィンドウサイズを標準サイズ（600x1067）にリセットし、最大化を解除しました');
      return { success: true };
    } else {
      console.error('メインウィンドウが見つかりません');
      return { success: false, error: 'メインウィンドウが見つかりません' };
    }
  } catch (error) {
    console.error('ウィンドウサイズのリセットに失敗しました:', error);
    return { success: false, error: error.message };
  }
});

// 設定の読み込み
ipcMain.handle('load-settings', async () => {
  try {
    return await loadSettings();
  } catch (error) {
    console.error('Error loading settings:', error);
    return { success: false, error: error.message };
  }
});

// 設定の保存
ipcMain.handle('save-settings', async (event, settings) => {
  try {
    const result = await saveSettings(settings);
    if (result.success) {
      // 設定保存後、パスワードファイルのパスを更新
      PASSWORD_FILE = path.join(settings.storageLocation, 'passwords.json');
    }
    return result;
  } catch (error) {
    console.error('Error saving settings:', error);
    return { success: false, error: error.message };
  }
});

// フォルダー選択ダイアログを開く
ipcMain.handle('select-storage-folder', async () => {
  try {
    const { dialog } = require('electron');
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
      title: 'パスワードファイルの保存場所を選択'
    });
    
    if (!result.canceled && result.filePaths.length > 0) {
      return { success: true, folderPath: result.filePaths[0] };
    } else {
      return { success: false, error: 'キャンセルされました' };
    }
  } catch (error) {
    console.error('Error selecting folder:', error);
    return { success: false, error: error.message };
  }
});