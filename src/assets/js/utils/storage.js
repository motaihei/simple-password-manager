// データ保存・読み込みユーティリティ

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
        console.error('Error opening folder:', error);
    }
}

export { savePasswords, loadPasswords, openPasswordFolder };