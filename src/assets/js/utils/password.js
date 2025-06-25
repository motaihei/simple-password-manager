// パスワード生成・管理ユーティリティ

/**
 * パスワード生成
 * @param {string} charType - 文字種類 ('alphanumeric' または 'withSymbols')
 * @param {number} length - パスワード長
 * @returns {string} 生成されたパスワード
 */
function generatePassword(charType = 'alphanumeric', length = 8) {
    let chars;
    if (charType === 'alphanumeric') {
        chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    } else {
        chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    }
    
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

/**
 * 現在の生成設定を取得
 * @returns {object} 生成設定オブジェクト
 */
function getPasswordGenerationSettings() {
    const charType = document.querySelector('input[name="charType"]:checked')?.value || 'alphanumeric';
    const length = parseInt(document.getElementById('passwordLength')?.value) || 8;
    
    return { charType, length };
}

/**
 * パスワードをクリップボードにコピー
 * @param {string} id - パスワードID
 * @param {HTMLElement} buttonElement - ボタン要素
 * @param {Array} passwords - パスワード配列
 */
async function copyPassword(id, buttonElement, passwords) {
    const password = passwords.find(p => p.id === id);
    try {
        await window.electronAPI.copyToClipboard(password.password);
        
        // フィードバック表示
        const originalText = buttonElement.textContent;
        buttonElement.textContent = '✓';
        setTimeout(() => {
            buttonElement.textContent = originalText;
        }, 1000);
    } catch (error) {
        console.error('クリップボードにコピーできませんでした:', error);
        // エラー時のフィードバック
        const originalText = buttonElement.textContent;
        buttonElement.textContent = '×';
        setTimeout(() => {
            buttonElement.textContent = originalText;
        }, 1000);
    }
}

export { generatePassword, getPasswordGenerationSettings, copyPassword };