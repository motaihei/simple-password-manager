// パスワード管理アプリのレンダラープロセス

let passwords = [];
let editingId = null;

// DOM要素の取得
const searchBox = document.getElementById('searchBox');
const addBtn = document.getElementById('addBtn');
const openFolderBtn = document.getElementById('openFolderBtn');
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

// 詳細モーダルのDOM要素
const detailModal = document.getElementById('detailModal');
const closeDetailModal = document.getElementById('closeDetailModal');
const detailEntryName = document.getElementById('detailEntryName');
const detailUsername = document.getElementById('detailUsername');
const detailPassword = document.getElementById('detailPassword');
const detailUpdatedAt = document.getElementById('detailUpdatedAt');
const detailToggleBtn = document.getElementById('detailToggleBtn');
const detailCopyBtn = document.getElementById('detailCopyBtn');
const detailUpdateBtn = document.getElementById('detailUpdateBtn');
const detailEditBtn = document.getElementById('detailEditBtn');
const detailDeleteBtn = document.getElementById('detailDeleteBtn');

// パスワードの表示状態を管理
let isPasswordVisible = false;
let currentPassword = '';

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
        <tr style="cursor: pointer;" data-id="${password.id}">
            <td>${escapeHtml(password.entryName)}</td>
            <td>${escapeHtml(password.username)}</td>
            <td>
                <div class="password-cell">
                    <span class="password-text" data-id="${password.id}" data-hidden="true">••••••••</span>
                    <button class="btn btn-secondary btn-sm" data-action="copy" data-id="${password.id}">📋</button>
                </div>
            </td>
            <td>${formatDateTime(password.updatedAt)}</td>
            <td></td>
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
    
    return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
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

// 詳細モーダルの表示
function showDetailModal(id) {
    const password = passwords.find(p => p.id === id);
    if (!password) return;
    
    detailEntryName.textContent = password.entryName;
    detailUsername.textContent = password.username;
    
    // パスワードを初期状態で非表示に設定
    currentPassword = password.password;
    isPasswordVisible = false;
    detailPassword.textContent = '••••••••';
    detailToggleBtn.textContent = '👁️ 表示';
    
    detailUpdatedAt.textContent = formatDateTime(password.updatedAt);
    
    // ボタンにIDを保存
    detailToggleBtn.dataset.id = id;
    detailCopyBtn.dataset.id = id;
    detailUpdateBtn.dataset.id = id;
    detailEditBtn.dataset.id = id;
    detailDeleteBtn.dataset.id = id;
    
    detailModal.style.display = 'block';
}

// 詳細モーダルを閉じる
function hideDetailModal() {
    detailModal.style.display = 'none';
    // パスワード表示状態をリセット
    isPasswordVisible = false;
    currentPassword = '';
}

// パスワードの表示・非表示を切り替え
function togglePasswordVisibility() {
    if (isPasswordVisible) {
        // 非表示に切り替え
        detailPassword.textContent = '••••••••';
        detailToggleBtn.textContent = '👁️ 表示';
        isPasswordVisible = false;
    } else {
        // 表示に切り替え
        detailPassword.textContent = currentPassword;
        detailToggleBtn.textContent = '🙈 非表示';
        isPasswordVisible = true;
    }
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

// フォルダーを開くボタンのイベントリスナー
openFolderBtn.addEventListener('click', async () => {
    try {
        const result = await window.electronAPI.openPasswordFolder();
        if (!result.success) {
            console.error('フォルダーを開けませんでした:', result.error);
        }
    } catch (error) {
        console.error('エラーが発生しました:', error);
    }
});

closeModal.addEventListener('click', hideModal);
cancelBtn.addEventListener('click', hideModal);

generateBtn.addEventListener('click', () => {
    passwordInput.value = generatePassword();
});

// テーブルのクリックイベントを委譲で処理
passwordList.addEventListener('click', (e) => {
    const button = e.target.closest('button');
    
    if (button && button.dataset.action === 'copy') {
        // コピーボタンの処理
        e.stopPropagation();
        copyPassword(button.dataset.id, button);
        return;
    }
    
    // 行クリックで詳細モーダルを表示
    const row = e.target.closest('tr');
    if (row && row.dataset.id) {
        showDetailModal(row.dataset.id);
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
    if (e.target === detailModal) {
        hideDetailModal();
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

// 詳細モーダルのイベントリスナー
closeDetailModal.addEventListener('click', hideDetailModal);

detailToggleBtn.addEventListener('click', togglePasswordVisibility);

detailCopyBtn.addEventListener('click', async () => {
    const id = detailCopyBtn.dataset.id;
    await copyPassword(id, detailCopyBtn);
});

detailUpdateBtn.addEventListener('click', () => {
    const id = detailUpdateBtn.dataset.id;
    hideDetailModal();
    updatePassword(id);
});

detailEditBtn.addEventListener('click', () => {
    const id = detailEditBtn.dataset.id;
    hideDetailModal();
    editPassword(id);
});

detailDeleteBtn.addEventListener('click', () => {
    const id = detailDeleteBtn.dataset.id;
    hideDetailModal();
    deletePassword(id);
});

// 初期化実行
init();