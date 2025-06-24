const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // ファイル操作API
  loadPasswords: () => ipcRenderer.invoke('load-passwords'),
  savePasswords: (passwords) => ipcRenderer.invoke('save-passwords', passwords),
  
  // クリップボードAPI
  copyToClipboard: (text) => {
    return navigator.clipboard.writeText(text);
  }
});