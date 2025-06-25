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
 * @returns {string} フォーマットされた日時
 */
function formatDateTime(dateString) {
    if (!dateString) return '不明';
    
    const date = new Date(dateString);
    
    return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
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