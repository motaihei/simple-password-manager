// Jest setup file
require('@testing-library/jest-dom');

// Mock Electron API
global.window.electronAPI = {
  loadPasswords: jest.fn(),
  savePasswords: jest.fn(),
  copyToClipboard: jest.fn()
};

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn()
  }
});