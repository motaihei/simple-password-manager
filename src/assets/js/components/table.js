// テーブル表示・操作
import { escapeHtml, formatDateTime } from '../utils/dom.js';

class TableManager {
    constructor(searchBox) {
        this.searchBox = searchBox;
        this.passwordList = document.getElementById('passwordList');
        this.emptyState = document.getElementById('emptyState');
        this.passwordTable = document.getElementById('passwordTable');
        this.passwords = [];
        
        this.initEventListeners();
    }
    
    initEventListeners() {
        this.searchBox.addEventListener('input', () => this.render());
    }
    
    setPasswords(passwords) {
        this.passwords = passwords;
        this.render();
    }
    
    // ユーザー名の表示用処理（30文字制限）
    formatUsername(username) {
        // 半角英数字以外の文字を含む場合は制限なし
        if (!/^[a-zA-Z0-9]*$/.test(username)) {
            return escapeHtml(username);
        }
        
        // 半角英数字のみで30文字を超える場合は省略
        if (username.length > 30) {
            return escapeHtml(username.substring(0, 30)) + '...';
        }
        
        return escapeHtml(username);
    }
    
    render() {
        const searchTerm = this.searchBox.value.toLowerCase();
        let filteredPasswords = this.passwords.filter(p => 
            p.entryName.toLowerCase().includes(searchTerm)
        );

        // エントリが重複している場合は最新のもののみを表示
        const uniquePasswords = new Map();
        filteredPasswords.forEach(password => {
            const key = password.entryName.toLowerCase();
            if (!uniquePasswords.has(key) || 
                new Date(password.updatedAt) > new Date(uniquePasswords.get(key).updatedAt)) {
                uniquePasswords.set(key, password);
            }
        });
        
        filteredPasswords = Array.from(uniquePasswords.values());

        if (filteredPasswords.length === 0) {
            this.passwordTable.classList.add('hidden');
            this.emptyState.classList.remove('hidden');
            return;
        }

        this.passwordTable.classList.remove('hidden');
        this.emptyState.classList.add('hidden');

        this.passwordList.innerHTML = filteredPasswords.map(password => `
            <tr style="cursor: pointer;" data-id="${password.id}">
                <td>${escapeHtml(password.entryName)}</td>
                <td title="${escapeHtml(password.username)}">${this.formatUsername(password.username)}</td>
                <td>
                    <div class="password-cell">
                        <button class="btn btn-secondary btn-sm btn-table-action copy-password-btn" data-action="copy" data-id="${password.id}">📋 コピー</button>
                    </div>
                </td>
                <td>
                    <div class="password-cell">
                        <button class="btn btn-secondary btn-sm btn-table-action${password.url ? '' : ' disabled'}" 
                                data-action="open-url" 
                                data-id="${password.id}" 
                                ${password.url ? '' : 'disabled'}>
                            🔗 開く
                        </button>
                    </div>
                </td>
                <td>${formatDateTime(password.updatedAt)}</td>
            </tr>
        `).join('');
    }
}

export { TableManager };