// データ保存・読み込みユーティリティ
import { Logger } from './logger.js';

const logger = new Logger('StorageUtils');

/**
 * パスワードデータの保存
 * @param {Array} passwords - パスワード配列
 */
async function savePasswords(passwords) {
    await window.electronAPI.savePasswords(passwords);
}

/**
 * パスワードデータの読み込み
 * @returns {Array} パスワード配列
 */
async function loadPasswords() {
    return await window.electronAPI.loadPasswords();
}

/**
 * パスワードフォルダーを開く
 */
async function openPasswordFolder() {
    try {
        await window.electronAPI.openPasswordFolder();
    } catch (error) {
        logger.error('フォルダー開封エラー', error);
    }
}

export { savePasswords, loadPasswords, openPasswordFolder };