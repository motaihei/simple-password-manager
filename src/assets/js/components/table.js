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
    
    render() {
        const searchTerm = this.searchBox.value.toLowerCase();
        let filteredPasswords = this.passwords.filter(p => 
            p.entryName.toLowerCase().includes(searchTerm)
        );

        // エントリ名が重複している場合は最新のもののみを表示
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
                <td>${escapeHtml(password.username)}</td>
                <td>
                    <div class="password-cell">
                        <button class="btn btn-secondary btn-sm copy-password-btn" data-action="copy" data-id="${password.id}">📋 コピー</button>
                    </div>
                </td>
                <td>
                    <button class="btn btn-secondary btn-sm${password.url ? '' : ' disabled'}" 
                            data-action="open-url" 
                            data-id="${password.id}" 
                            ${password.url ? '' : 'disabled'}>
                        🔗 開く
                    </button>
                </td>
                <td>${formatDateTime(password.updatedAt)}</td>
                <td></td>
            </tr>
        `).join('');
    }
}

export { TableManager };