const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs').promises;

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 600,
    height: 1067,
    icon: path.join(__dirname, 'assets', 'icons', 'icon.ico'), // Windowsアイコン
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
  createWindow();

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