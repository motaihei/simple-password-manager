const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // ファイル操作API
  loadPasswords: () => ipcRenderer.invoke('load-passwords'),
  savePasswords: (passwords) => ipcRenderer.invoke('save-passwords', passwords),
  
  // フォルダーを開くAPI
  openPasswordFolder: () => ipcRenderer.invoke('open-password-folder'),
  
  // 設定ウィンドウAPI
  openSettingsWindow: () => ipcRenderer.invoke('open-settings'),
  closeSettingsWindow: () => ipcRenderer.invoke('close-settings'),
  
  // クリップボードAPI
  copyToClipboard: (text) => {
    return navigator.clipboard.writeText(text);
  }
});