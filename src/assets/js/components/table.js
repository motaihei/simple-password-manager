// テーブル表示・操作
import { escapeHtml, formatDateTime } from '../utils/dom.js';
import { TableResizer } from './table-resize.js';

class TableManager {
    constructor(searchBox) {
        this.searchBox = searchBox;
        this.passwordList = document.getElementById('passwordList');
        this.emptyState = document.getElementById('emptyState');
        this.passwordTable = document.getElementById('passwordTable');
        this.passwords = [];
        
        // ソート関連のプロパティ
        this.sortColumn = 'entryName'; // デフォルトはエントリ名でソート
        this.sortDirection = 'asc'; // 'asc' または 'desc'
        
        // リサイズ機能の初期化
        this.tableResizer = new TableResizer(this.passwordTable);
        
        this.initEventListeners();
    }
    
    initEventListeners() {
        this.searchBox.addEventListener('input', () => this.render());
        
        // テーブルヘッダーのクリックイベント
        const headers = this.passwordTable.querySelectorAll('thead th');
        headers.forEach((header, index) => {
            // データ属性でソート可能な列を識別
            const columnMap = ['entryName', 'username', '', '', 'updatedAt'];
            const column = columnMap[index];
            
            if (column) { // 空文字列（パスワード・URL列）以外はソート可能
                header.style.cursor = 'pointer';
                header.addEventListener('click', () => this.handleSort(column));
            }
        });
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
    
    // URLからホスト部分を抽出
    extractHost(url) {
        if (!url) return '';
        
        try {
            // プロトコルがない場合は追加
            const urlWithProtocol = url.startsWith('http') ? url : 'https://' + url;
            const urlObj = new URL(urlWithProtocol);
            return urlObj.hostname.toLowerCase();
        } catch (e) {
            // URLの解析に失敗した場合は元の文字列をそのまま返す
            return url.toLowerCase();
        }
    }
    
    // 文字列がURLかどうかを判定
    isUrl(str) {
        if (!str) return false;
        
        // URLっぽいパターンをチェック
        // http:// または https:// で始まる
        if (str.startsWith('http://') || str.startsWith('https://')) {
            return true;
        }
        
        // スラッシュを含み、ドットを含む（パスとドメインを持つ）
        if (str.includes('/') && str.includes('.')) {
            return true;
        }
        
        return false;
    }
    
    render() {
        const searchTerm = this.searchBox.value.toLowerCase();
        const searchMode = document.getElementById('searchMode').value;
        
        let filteredPasswords;
        
        if (searchMode === 'url') {
            // URL検索モード：ホストのあいまい検索
            filteredPasswords = this.passwords.filter(p => {
                if (!p.url) return false;
                
                const host = this.extractHost(p.url);
                
                // 検索語がURLの場合、ホスト部分のみを抽出して比較
                let searchHost = searchTerm;
                if (this.isUrl(searchTerm)) {
                    searchHost = this.extractHost(searchTerm);
                }
                
                return host.includes(searchHost);
            });
        } else {
            // エントリ検索モード（既存の動作）
            filteredPasswords = this.passwords.filter(p => 
                p.entryName.toLowerCase().includes(searchTerm)
            );
        }

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
        
        // 現在の設定に基づいてソート
        filteredPasswords = this.sortData(filteredPasswords);

        if (filteredPasswords.length === 0) {
            this.passwordTable.classList.add('hidden');
            this.emptyState.classList.remove('hidden');
            
            // URL検索モードで結果がない場合、検知したドメイン名を表示
            if (searchMode === 'url' && searchTerm) {
                let searchHost = searchTerm;
                if (this.isUrl(searchTerm)) {
                    searchHost = this.extractHost(searchTerm);
                }
                
                this.emptyState.innerHTML = `
                    <p>「${escapeHtml(searchHost)}」に一致するドメイン名が見つかりませんでした。</p>
                    <p style="color: #999; font-size: 14px; margin-top: 10px;">
                        検索したドメイン名: <strong>${escapeHtml(searchHost)}</strong>
                    </p>
                `;
            } else if (searchMode === 'entry' && searchTerm) {
                // エントリ検索モードで結果がない場合
                this.emptyState.innerHTML = `
                    <p>「${escapeHtml(searchTerm)}」に一致するエントリが見つかりませんでした。</p>
                `;
            } else {
                // デフォルトの空状態メッセージ
                this.emptyState.innerHTML = `
                    <p>パスワードが登録されていません。<br>「新規追加」ボタンから追加してください。</p>
                `;
            }
            return;
        }

        this.passwordTable.classList.remove('hidden');
        this.emptyState.classList.add('hidden');

        this.passwordList.innerHTML = filteredPasswords.map(password => {
            let entryDisplay = escapeHtml(password.entryName);
            
            // URL検索モードの場合、マッチしたホスト部分を表示
            if (searchMode === 'url' && password.url && searchTerm) {
                const host = this.extractHost(password.url);
                entryDisplay = `${escapeHtml(password.entryName)}<br><small style="color: #666; font-size: 12px;">🔗 ${escapeHtml(host)}</small>`;
            }
            
            return `
                <tr style="cursor: pointer;" data-id="${password.id}">
                    <td>${entryDisplay}</td>
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
            `;
        }).join('');
        
        // ヘッダーにソートアイコンを更新
        this.updateSortIcons();
    }
    
    // ソート処理
    handleSort(column) {
        // 同じ列をクリックした場合は昇順/降順を切り替え
        if (this.sortColumn === column) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            // 違う列をクリックした場合は昇順から開始
            this.sortColumn = column;
            this.sortDirection = 'asc';
        }
        
        // 再描画
        this.render();
    }
    
    // データのソート
    sortData(data) {
        return data.sort((a, b) => {
            let aValue, bValue;
            
            switch (this.sortColumn) {
                case 'entryName':
                    aValue = a.entryName.toLowerCase();
                    bValue = b.entryName.toLowerCase();
                    break;
                case 'username':
                    aValue = a.username.toLowerCase();
                    bValue = b.username.toLowerCase();
                    break;
                case 'updatedAt':
                    aValue = new Date(a.updatedAt).getTime();
                    bValue = new Date(b.updatedAt).getTime();
                    break;
                default:
                    return 0;
            }
            
            if (aValue < bValue) {
                return this.sortDirection === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return this.sortDirection === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }
    
    // ソートアイコンの更新
    updateSortIcons() {
        const headers = this.passwordTable.querySelectorAll('thead th');
        const columnMap = ['entryName', 'username', '', '', 'updatedAt'];
        
        headers.forEach((header, index) => {
            const column = columnMap[index];
            
            // 既存のソートアイコンを削除
            const existingIcon = header.querySelector('.sort-icon');
            if (existingIcon) {
                existingIcon.remove();
            }
            
            // ソート可能な列にアイコンを追加
            if (column) {
                const icon = document.createElement('span');
                icon.className = 'sort-icon';
                
                if (column === this.sortColumn) {
                    // 現在ソート中の列
                    icon.textContent = this.sortDirection === 'asc' ? ' ▲' : ' ▼';
                    icon.style.opacity = '1';
                } else {
                    // ソート可能な他の列
                    icon.textContent = ' ▼';
                    icon.style.opacity = '0.3';
                }
                
                header.appendChild(icon);
            }
        });
    }
}

export { TableManager };