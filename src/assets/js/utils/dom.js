// DOM操作ユーティリティ

/**
 * HTMLエスケープ
 * @param {string} text - エスケープするテキスト
 * @returns {string} エスケープされたHTML
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * 日時フォーマット
 * @param {string} dateString - フォーマットする日時文字列
 * @param {boolean} includeTime - 時刻を含めるかどうか（デフォルト: false）
 * @returns {string} フォーマットされた日時
 */
function formatDateTime(dateString, includeTime = false) {
    if (!dateString) return '不明';
    
    const date = new Date(dateString);
    
    if (includeTime) {
        return date.toLocaleString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    } else {
        return date.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }
}

/**
 * モーダルの表示/非表示を切り替え
 * @param {HTMLElement} modal - モーダル要素
 * @param {boolean} show - 表示するかどうか
 */
function toggleModal(modal, show) {
    modal.style.display = show ? 'block' : 'none';
}

export { escapeHtml, formatDateTime, toggleModal };