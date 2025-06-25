// パスワード管理アプリのレンダラープロセス

let passwords = [];
let editingId = null;

// DOM要素の取得
const searchBox = document.getElementById('searchBox');
const addBtn = document.getElementById('addBtn');
const passwordList = document.getElementById('passwordList');
const emptyState = document.getElementById('emptyState');
const passwordTable = document.getElementById('passwordTable');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const passwordForm = document.getElementById('passwordForm');
const entryNameInput = document.getElementById('entryName');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const generateBtn = document.getElementById('generateBtn');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.querySelector('.theme-icon');

// 初期化
async function init() {
    passwords = await window.electronAPI.loadPasswords();
    renderPasswordList();
    
    // ダークモード設定の復元
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
        document.body.classList.add('dark-mode');
        themeIcon.textContent = '☀️';
    }
}

// パスワードリストの表示
function renderPasswordList() {
    const searchTerm = searchBox.value.toLowerCase();
    let filteredPasswords = passwords.filter(p => 
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
        passwordTable.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }

    passwordTable.classList.remove('hidden');
    emptyState.classList.add('hidden');

    passwordList.innerHTML = filteredPasswords.map(password => `
        <tr>
            <td>${escapeHtml(password.entryName)}</td>
            <td>${escapeHtml(password.username)}</td>
            <td>
                <div class="password-cell">
                    <span class="password-text" data-id="${password.id}" data-hidden="true">••••••••</span>
                    <button class="btn btn-secondary btn-sm" data-action="copy" data-id="${password.id}">📋</button>
                </div>
            </td>
            <td>${formatDateTime(password.updatedAt)}</td>
            <td>
                <button class="btn btn-secondary btn-sm" data-action="update" data-id="${password.id}">更新</button>
                <button class="btn btn-secondary btn-sm" data-action="edit" data-id="${password.id}">編集</button>
                <button class="btn btn-danger btn-sm" data-action="delete" data-id="${password.id}">削除</button>
            </td>
        </tr>
    `).join('');
}

// HTMLエスケープ
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 日時フォーマット
function formatDateTime(dateString) {
    if (!dateString) return '不明';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 1) {
        return 'たった今';
    } else if (diffMins < 60) {
        return `${diffMins}分前`;
    } else if (diffHours < 24) {
        return `${diffHours}時間前`;
    } else if (diffDays < 7) {
        return `${diffDays}日前`;
    } else {
        return date.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}


// パスワードをクリップボードにコピー
async function copyPassword(id, buttonElement) {
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
};

// パスワードの更新
function updatePassword(id) {
    const password = passwords.find(p => p.id === id);
    editingId = 'update-' + id;
    
    modalTitle.textContent = 'パスワード更新';
    entryNameInput.value = password.entryName;
    entryNameInput.disabled = true;
    usernameInput.value = password.username;
    usernameInput.disabled = true;
    passwordInput.value = generatePassword();
    
    showModal();
};

// パスワードの編集
function editPassword(id) {
    editingId = id;
    const password = passwords.find(p => p.id === id);
    
    modalTitle.textContent = 'パスワード編集';
    entryNameInput.value = password.entryName;
    entryNameInput.disabled = false;
    usernameInput.value = password.username;
    usernameInput.disabled = false;
    passwordInput.value = password.password;
    
    showModal();
};

// パスワードの削除
function deletePassword(id) {
    const password = passwords.find(p => p.id === id);
    if (confirm(`${password.entryName}を削除しますか？`)) {
        passwords = passwords.filter(p => p.id !== id);
        savePasswords();
    }
};

// パスワード生成
function generatePassword() {
    // 生成設定を取得
    const charType = document.querySelector('input[name="charType"]:checked')?.value || 'alphanumeric';
    const length = parseInt(document.getElementById('passwordLength')?.value) || 8;
    
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

// モーダルの表示
function showModal() {
    modal.style.display = 'block';
    entryNameInput.focus();
}

// モーダルの非表示
function hideModal() {
    modal.style.display = 'none';
    passwordForm.reset();
    entryNameInput.disabled = false;
    usernameInput.disabled = false;
    editingId = null;
}

// データの保存
async function savePasswords() {
    await window.electronAPI.savePasswords(passwords);
    renderPasswordList();
}

// イベントリスナー
searchBox.addEventListener('input', renderPasswordList);

addBtn.addEventListener('click', () => {
    editingId = null;
    modalTitle.textContent = '新規パスワード';
    entryNameInput.disabled = false;
    usernameInput.disabled = false;
    showModal();
});

closeModal.addEventListener('click', hideModal);
cancelBtn.addEventListener('click', hideModal);

generateBtn.addEventListener('click', () => {
    passwordInput.value = generatePassword();
});

// テーブルのクリックイベントを委譲で処理
passwordList.addEventListener('click', (e) => {
    const button = e.target.closest('button');
    if (!button) return;
    
    const action = button.dataset.action;
    const id = button.dataset.id;
    
    switch(action) {
        case 'copy':
            copyPassword(id, button);
            break;
        case 'update':
            updatePassword(id);
            break;
        case 'edit':
            editPassword(id);
            break;
        case 'delete':
            deletePassword(id);
            break;
    }
});

passwordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const data = {
        entryName: entryNameInput.value,
        username: usernameInput.value,
        password: passwordInput.value,
        updatedAt: new Date().toISOString()
    };
    
    if (editingId && editingId.startsWith('update-')) {
        // 更新の場合は新しいエントリとして追加
        data.id = Date.now().toString();
        passwords.push(data);
    } else if (editingId) {
        // 編集の場合は既存のエントリを更新
        const index = passwords.findIndex(p => p.id === editingId);
        passwords[index] = { ...passwords[index], ...data };
    } else {
        // 新規の場合は重複チェック
        const existingEntry = passwords.find(p => 
            p.entryName.toLowerCase() === data.entryName.toLowerCase()
        );
        
        if (existingEntry) {
            // 重複している場合は確認
            const confirmed = confirm(
                `エントリ名「${data.entryName}」は既に存在します。\n` +
                `既存のエントリに加えて新しいエントリとして登録しますか？\n\n` +
                `※ 一覧表では最新のエントリのみが表示されます。`
            );
            
            if (!confirmed) {
                return; // キャンセルされた場合は処理を中止
            }
        }
        
        // 新しいエントリとして追加
        data.id = Date.now().toString();
        passwords.push(data);
    }
    
    await savePasswords();
    hideModal();
});

// モーダル外クリックで閉じる
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        hideModal();
    }
});

// ダークモード切り替え
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    
    // アイコンの更新
    themeIcon.textContent = isDarkMode ? '☀️' : '🌙';
    
    // 設定の保存
    localStorage.setItem('darkMode', isDarkMode);
});

// 初期化実行
init();