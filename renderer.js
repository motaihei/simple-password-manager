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

// 初期化
async function init() {
    passwords = await window.electronAPI.loadPasswords();
    renderPasswordList();
}

// パスワードリストの表示
function renderPasswordList() {
    const searchTerm = searchBox.value.toLowerCase();
    const filteredPasswords = passwords.filter(p => 
        p.entryName.toLowerCase().includes(searchTerm)
    );

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
                    <button class="btn btn-secondary btn-sm" data-action="toggle" data-id="${password.id}">表示</button>
                    <button class="btn btn-secondary btn-sm" data-action="copy" data-id="${password.id}">📋</button>
                </div>
            </td>
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

// パスワードの表示/非表示切り替え
function togglePassword(id) {
    const password = passwords.find(p => p.id === id);
    const element = document.querySelector(`.password-text[data-id="${id}"]`);
    const button = element.nextElementSibling;
    
    if (element.dataset.hidden === 'true') {
        element.textContent = password.password;
        element.dataset.hidden = 'false';
        button.textContent = '非表示';
    } else {
        element.textContent = '••••••••';
        element.dataset.hidden = 'true';
        button.textContent = '表示';
    }
};

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
    const newPassword = generatePassword();
    
    if (confirm(`${password.entryName}のパスワードを更新しますか？\n\n新しいパスワード: ${newPassword}`)) {
        password.password = newPassword;
        password.updatedAt = new Date().toISOString();
        savePasswords();
    }
};

// パスワードの編集
function editPassword(id) {
    editingId = id;
    const password = passwords.find(p => p.id === id);
    
    modalTitle.textContent = 'パスワード編集';
    entryNameInput.value = password.entryName;
    usernameInput.value = password.username;
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
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let password = '';
    for (let i = 0; i < 16; i++) {
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
        case 'toggle':
            togglePassword(id);
            break;
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
    
    if (editingId) {
        const index = passwords.findIndex(p => p.id === editingId);
        passwords[index] = { ...passwords[index], ...data };
    } else {
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

// 初期化実行
init();