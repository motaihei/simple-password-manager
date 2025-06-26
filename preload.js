const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // ファイル操作API
  loadPasswords: () => ipcRenderer.invoke('load-passwords'),
  savePasswords: (passwords) => ipcRenderer.invoke('save-passwords', passwords),
  
  // フォルダーを開くAPI
  openPasswordFolder: () => ipcRenderer.invoke('open-password-folder'),
  
  // URLを開くAPI
  openUrl: (url) => ipcRenderer.invoke('open-url', url),
  
  // ウィンドウサイズリセットAPI
  resetWindowSize: () => ipcRenderer.invoke('reset-window-size'),
  
  // 設定API
  loadSettings: () => ipcRenderer.invoke('load-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  selectStorageFolder: () => ipcRenderer.invoke('select-storage-folder'),
  
  // クリップボードAPI
  copyToClipboard: (text) => {
    return navigator.clipboard.writeText(text);
  }
});