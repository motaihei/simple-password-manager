// メインアプリケーション
import { ModalManager } from './components/modal.js';
import { TableManager } from './components/table.js';
import { ThemeManager } from './components/theme.js';
import { SearchManager } from './components/search.js';
import { copyPassword } from './utils/password.js';
import { savePasswords, loadPasswords, openPasswordFolder } from './utils/storage.js';
import { formatDateTime } from './utils/dom.js';

class PasswordManagerApp {
    constructor() {
        this.passwords = [];
        this.editingId = null;
        
        // DOM要素の取得
        this.searchBox = document.getElementById('searchBox');
        this.addBtn = document.getElementById('addBtn');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.passwordList = document.getElementById('passwordList');
        this.passwordForm = document.getElementById('passwordForm');
        this.openFolderBtnModal = document.getElementById('openFolderBtnModal');
        
        // マネージャーの初期化
        this.modalManager = new ModalManager();
        this.tableManager = new TableManager(this.searchBox);
        this.themeManager = new ThemeManager();
        this.searchManager = new SearchManager(this.searchBox, this.tableManager);
        
        this.initEventListeners();
        this.init();
    }
    
    async init() {
        this.passwords = await loadPasswords();
        this.tableManager.setPasswords(this.passwords);
    }
    
    initEventListeners() {
        // 新規追加ボタン
        this.addBtn.addEventListener('click', () => {
            this.modalManager.setupForAdd();
        });
        
        // 設定ボタン
        this.settingsBtn.addEventListener('click', () => {
            this.modalManager.showSettingsModal();
        });
        
        // フォーム送信
        this.passwordForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        
        // テーブルのクリックイベント
        this.passwordList.addEventListener('click', (e) => this.handleTableClick(e));
        
        // 詳細モーダルのボタンイベント
        this.modalManager.detailUpdateBtn.addEventListener('click', () => this.handleDetailUpdate());
        this.modalManager.detailEditBtn.addEventListener('click', () => this.handleDetailEdit());
        this.modalManager.detailDeleteBtn.addEventListener('click', () => this.handleDetailDelete());
        
        // 設定モーダルのフォルダーボタン
        this.modalManager.openFolderBtnModal.addEventListener('click', () => openPasswordFolder());
    }
    
    async handleFormSubmit(e) {
        e.preventDefault();
        
        const data = {
            entryName: this.modalManager.entryNameInput.value,
            username: this.modalManager.usernameInput.value,
            url: this.modalManager.urlInput.value || null,
            password: this.modalManager.passwordInput.value,
            notes: this.modalManager.notesInput.value || '',
            updatedAt: new Date().toISOString()
        };
        
        if (this.modalManager.editingId && this.modalManager.editingId.startsWith('update-')) {
            // 更新の場合の確認ダイアログ
            const confirmed = confirm(
                `エントリ「${data.entryName}」のパスワードを更新しますか？\n\n` +
                `この操作により、新しいパスワードで別のエントリが作成されます。\n` +
                `既存のエントリは履歴として残ります。`
            );
            
            if (!confirmed) {
                return;
            }
            
            // 更新の場合は新しいエントリとして追加
            data.id = Date.now().toString();
            this.passwords.push(data);
        } else if (this.modalManager.editingId) {
            // 編集の場合の確認ダイアログ
            const confirmed = confirm(
                `エントリ「${data.entryName}」を編集しますか？\n\n` +
                `この操作により、既存のエントリ情報が上書きされます。\n` +
                `編集前の情報は失われます。`
            );
            
            if (!confirmed) {
                return;
            }
            
            // 編集の場合は既存のエントリを更新
            const index = this.passwords.findIndex(p => p.id === this.modalManager.editingId);
            this.passwords[index] = { ...this.passwords[index], ...data };
        } else {
            // 新規の場合は重複チェック
            const existingEntry = this.passwords.find(p => 
                p.entryName.toLowerCase() === data.entryName.toLowerCase()
            );
            
            if (existingEntry) {
                // 重複している場合は確認
                const confirmed = confirm(
                    `エントリ「${data.entryName}」は既に存在します。\n` +
                    `既存のエントリに加えて新しいエントリとして登録しますか？\n\n` +
                    `※ 一覧表では最新のエントリのみが表示されます。`
                );
                
                if (!confirmed) {
                    return; // キャンセルされた場合は処理を中止
                }
            }
            
            // 新しいエントリとして追加
            data.id = Date.now().toString();
            this.passwords.push(data);
        }
        
        await this.savePasswordsAndRefresh();
        this.modalManager.hideMainModal();
    }
    
    handleTableClick(e) {
        const button = e.target.closest('button');
        
        if (button && button.dataset.action === 'copy') {
            // コピーボタンの処理
            e.stopPropagation();
            copyPassword(button.dataset.id, button, this.passwords);
            return;
        }
        
        if (button && button.dataset.action === 'open-url') {
            // URLを開くボタンの処理
            e.stopPropagation();
            this.handleOpenUrl(button.dataset.id);
            return;
        }
        
        // 行クリックで詳細モーダルを表示
        const row = e.target.closest('tr');
        if (row && row.dataset.id) {
            const password = this.passwords.find(p => p.id === row.dataset.id);
            if (password) {
                // フォーマット済みの日付を設定
                const formattedPassword = {
                    ...password,
                    updatedAt: formatDateTime(password.updatedAt)
                };
                this.modalManager.showDetailModal(formattedPassword);
            }
        }
    }
    
    
    handleDetailUpdate() {
        const id = this.modalManager.detailUpdateBtn.dataset.id;
        const password = this.passwords.find(p => p.id === id);
        this.modalManager.hideDetailModal();
        this.modalManager.setupForUpdate(password);
    }
    
    handleDetailEdit() {
        const id = this.modalManager.detailEditBtn.dataset.id;
        const password = this.passwords.find(p => p.id === id);
        this.modalManager.hideDetailModal();
        this.modalManager.setupForEdit(password);
    }
    
    handleDetailDelete() {
        const id = this.modalManager.detailDeleteBtn.dataset.id;
        const password = this.passwords.find(p => p.id === id);
        this.modalManager.hideDetailModal();
        
        if (confirm(`${password.entryName}を削除しますか？`)) {
            this.passwords = this.passwords.filter(p => p.id !== id);
            this.savePasswordsAndRefresh();
        }
    }
    
    async handleOpenUrl(id) {
        const password = this.passwords.find(p => p.id === id);
        if (password && password.url) {
            try {
                await window.electronAPI.openUrl(password.url);
            } catch (error) {
                console.error('Error opening URL:', error);
            }
        }
    }
    
    async savePasswordsAndRefresh() {
        await savePasswords(this.passwords);
        this.tableManager.setPasswords(this.passwords);
    }
}

// アプリケーションの起動
document.addEventListener('DOMContentLoaded', () => {
    new PasswordManagerApp();
});