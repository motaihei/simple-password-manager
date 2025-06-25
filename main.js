const { app, BrowserWindow, ipcMain, shell, Menu } = require('electron');
const path = require('path');
const fs = require('fs').promises;

let mainWindow = null;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 1067,
    icon: path.join(__dirname, 'assets', 'icons', 'icon.ico'), // Windowsアイコン
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile('index.html');
};


app.whenReady().then(() => {
  // アプリケーションメニューを無効化
  Menu.setApplicationMenu(null);
  
  createWindow();
  
  // IPCハンドラー登録の確認ログ
  console.log('IPCハンドラーが登録されました: load-passwords, save-passwords, open-password-folder');

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ファイル操作API
const PASSWORD_FILE = path.join(app.getPath('userData'), 'passwords.json');

// パスワードデータの読み込み
ipcMain.handle('load-passwords', async () => {
  try {
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
    const userDataPath = app.getPath('userData');
    console.log('フォルダーパス:', userDataPath);
    await shell.openPath(userDataPath);
    console.log('フォルダーを正常に開きました');
    return { success: true };
  } catch (error) {
    console.error('Error opening folder:', error);
    return { success: false, error: error.message };
  }
});