const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // ファイル操作API
  loadPasswords: () => ipcRenderer.invoke('load-passwords'),
  savePasswords: (passwords) => ipcRenderer.invoke('save-passwords', passwords),
  
  // フォルダーを開くAPI
  openPasswordFolder: () => ipcRenderer.invoke('open-password-folder'),
  
  // URLを開くAPI
  openUrl: (url) => ipcRenderer.invoke('open-url', url),
  
  // クリップボードAPI
  copyToClipboard: (text) => {
    return navigator.clipboard.writeText(text);
  }
});