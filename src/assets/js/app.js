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
        this.searchClearBtn = document.getElementById('searchClearBtn');
        this.searchModeSelect = document.getElementById('searchMode');
        this.addBtn = document.getElementById('addBtn');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.windowResetBtn = document.getElementById('windowResetBtn');
        this.passwordList = document.getElementById('passwordList');
        this.passwordForm = document.getElementById('passwordForm');
        this.openFolderBtnModal = document.getElementById('openFolderBtnModal');
        this.changeStoragePathBtn = document.getElementById('changeStoragePathBtn');
        this.currentStoragePath = document.getElementById('currentStoragePath');
        
        // コンテキストメニュー要素
        this.searchBoxContextMenu = document.getElementById('searchBoxContextMenu');
        this.pasteMenuItem = document.getElementById('pasteMenuItem');
        
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
        await this.loadSettings();
    }
    
    async loadSettings() {
        try {
            const settings = await window.electronAPI.loadSettings();
            if (this.currentStoragePath) {
                this.currentStoragePath.textContent = settings.storageLocation;
            }
        } catch (error) {
            console.error('設定の読み込みに失敗しました:', error);
        }
    }
    
    initEventListeners() {
        // 新規追加ボタン
        this.addBtn.addEventListener('click', () => {
            this.modalManager.setupForAdd();
        });
        
        // 設定ボタン
        this.settingsBtn.addEventListener('click', async () => {
            await this.loadSettings();
            this.modalManager.showSettingsModal();
        });
        
        // ウィンドウサイズリセットボタン
        this.windowResetBtn.addEventListener('click', () => {
            this.handleWindowReset();
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
        
        // 保存場所変更ボタン
        this.changeStoragePathBtn.addEventListener('click', () => this.handleChangeStoragePath());
        
        // 検索クリアボタン
        this.searchClearBtn.addEventListener('click', () => this.handleSearchClear());
        
        // 検索ボックスの右クリックイベント
        this.searchBox.addEventListener('contextmenu', (e) => this.handleSearchBoxContextMenu(e));
        
        // コンテキストメニューのクリックイベント
        this.pasteMenuItem.addEventListener('click', () => this.handlePasteToSearchBox());
        
        // コンテキストメニューを隠すイベント
        document.addEventListener('click', (e) => this.hideContextMenu(e));
        document.addEventListener('contextmenu', (e) => {
            if (e.target !== this.searchBox) {
                this.hideContextMenu(e);
            }
        });
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
                // フォーマット済みの日時を設定（詳細表示では時刻も含める）
                const formattedPassword = {
                    ...password,
                    updatedAt: formatDateTime(password.updatedAt, true)
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
    
    async handleWindowReset() {
        try {
            await window.electronAPI.resetWindowSize();
            console.log('ウィンドウサイズをリセットしました');
        } catch (error) {
            console.error('ウィンドウサイズのリセットに失敗しました:', error);
        }
    }
    
    async handleChangeStoragePath() {
        try {
            const result = await window.electronAPI.selectStorageFolder();
            
            if (result.success && result.folderPath) {
                const confirmed = confirm(
                    `パスワードファイルの保存場所を以下に変更しますか？\n\n` +
                    `新しい保存場所: ${result.folderPath}\n\n` +
                    `注意: 既存のパスワードファイルは新しい場所には自動的に移動されません。\n` +
                    `必要に応じて手動でファイルをコピーしてください。`
                );
                
                if (confirmed) {
                    const settings = await window.electronAPI.loadSettings();
                    settings.storageLocation = result.folderPath;
                    
                    const saveResult = await window.electronAPI.saveSettings(settings);
                    
                    if (saveResult.success) {
                        this.currentStoragePath.textContent = result.folderPath;
                        alert('保存場所を変更しました。');
                    } else {
                        alert('保存場所の変更に失敗しました: ' + saveResult.error);
                    }
                }
            } else if (result.error !== 'キャンセルされました') {
                alert('フォルダーの選択に失敗しました: ' + result.error);
            }
        } catch (error) {
            console.error('保存場所の変更に失敗しました:', error);
            alert('保存場所の変更に失敗しました。');
        }
    }
    
    handleSearchClear() {
        this.searchBox.value = '';
        this.searchManager.clearSearch();
    }
    
    async handleSearchBoxContextMenu(e) {
        e.preventDefault();
        
        // クリップボードの内容をチェック
        try {
            const clipboardText = await navigator.clipboard.readText();
            
            // クリップボードに文字列があるかチェック
            if (clipboardText && clipboardText.trim().length > 0) {
                this.pasteMenuItem.classList.remove('disabled');
            } else {
                this.pasteMenuItem.classList.add('disabled');
            }
        } catch (error) {
            // クリップボードアクセスに失敗した場合は無効にする
            this.pasteMenuItem.classList.add('disabled');
        }
        
        // コンテキストメニューを表示
        this.showContextMenu(e.clientX, e.clientY);
    }
    
    showContextMenu(x, y) {
        this.searchBoxContextMenu.style.left = `${x}px`;
        this.searchBoxContextMenu.style.top = `${y}px`;
        this.searchBoxContextMenu.classList.remove('hidden');
    }
    
    hideContextMenu(e) {
        if (!this.searchBoxContextMenu.contains(e.target)) {
            this.searchBoxContextMenu.classList.add('hidden');
        }
    }
    
    async handlePasteToSearchBox() {
        // 無効状態なら何もしない
        if (this.pasteMenuItem.classList.contains('disabled')) {
            return;
        }
        
        try {
            const clipboardText = await navigator.clipboard.readText();
            if (clipboardText && clipboardText.trim().length > 0) {
                this.searchBox.value = clipboardText.trim();
                this.searchManager.handleSearch();
                this.searchBox.focus();
            }
        } catch (error) {
            console.error('クリップボードからの貼り付けに失敗しました:', error);
        }
        
        // コンテキストメニューを隠す
        this.searchBoxContextMenu.classList.add('hidden');
    }
}

// アプリケーションの起動
document.addEventListener('DOMContentLoaded', () => {
    new PasswordManagerApp();
});