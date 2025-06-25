// モーダル機能
import { toggleModal } from '../utils/dom.js';
import { generatePassword, getPasswordGenerationSettings } from '../utils/password.js';

class ModalManager {
    constructor() {
        this.modal = document.getElementById('modal');
        this.modalTitle = document.getElementById('modalTitle');
        this.closeModal = document.getElementById('closeModal');
        this.cancelBtn = document.getElementById('cancelBtn');
        this.passwordForm = document.getElementById('passwordForm');
        this.entryNameInput = document.getElementById('entryName');
        this.usernameInput = document.getElementById('username');
        this.urlInput = document.getElementById('url');
        this.passwordInput = document.getElementById('password');
        this.notesInput = document.getElementById('notes');
        this.generateBtn = document.getElementById('generateBtn');
        
        this.detailModal = document.getElementById('detailModal');
        this.closeDetailModal = document.getElementById('closeDetailModal');
        this.detailEntryName = document.getElementById('detailEntryName');
        this.detailUsername = document.getElementById('detailUsername');
        this.detailPassword = document.getElementById('detailPassword');
        this.detailUrl = document.getElementById('detailUrl');
        this.detailNotes = document.getElementById('detailNotes');
        this.detailUpdatedAt = document.getElementById('detailUpdatedAt');
        this.detailToggleBtn = document.getElementById('detailToggleBtn');
        this.detailUpdateBtn = document.getElementById('detailUpdateBtn');
        this.detailEditBtn = document.getElementById('detailEditBtn');
        this.detailDeleteBtn = document.getElementById('detailDeleteBtn');
        
        this.settingsModal = document.getElementById('settingsModal');
        this.closeSettingsModal = document.getElementById('closeSettingsModal');
        this.openFolderBtnModal = document.getElementById('openFolderBtnModal');
        
        this.editingId = null;
        this.isPasswordVisible = false;
        this.currentPassword = '';
        
        this.initEventListeners();
    }
    
    initEventListeners() {
        // メインモーダル
        this.closeModal.addEventListener('click', () => this.hideMainModal());
        this.cancelBtn.addEventListener('click', () => this.hideMainModal());
        this.generateBtn.addEventListener('click', () => this.generatePasswordHandler());
        
        // 詳細モーダル
        this.closeDetailModal.addEventListener('click', () => this.hideDetailModal());
        this.detailToggleBtn.addEventListener('click', () => this.togglePasswordVisibility());
        
        // 設定モーダル
        this.closeSettingsModal.addEventListener('click', () => this.hideSettingsModal());
        
        // モーダル外クリック
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hideMainModal();
            }
            if (e.target === this.detailModal) {
                this.hideDetailModal();
            }
            if (e.target === this.settingsModal) {
                this.hideSettingsModal();
            }
        });
    }
    
    showMainModal() {
        toggleModal(this.modal, true);
        this.entryNameInput.focus();
    }
    
    hideMainModal() {
        toggleModal(this.modal, false);
        this.passwordForm.reset();
        this.entryNameInput.disabled = false;
        this.usernameInput.disabled = false;
        this.urlInput.disabled = false;
        this.notesInput.value = '';
        this.editingId = null;
    }
    
    showDetailModal(password) {
        this.detailEntryName.textContent = password.entryName;
        this.detailUsername.textContent = password.username;
        
        // パスワードを初期状態で非表示に設定
        this.currentPassword = password.password;
        this.isPasswordVisible = false;
        this.detailPassword.textContent = '••••••••';
        this.detailToggleBtn.textContent = '👁️ 表示';
        
        // URLの表示
        this.detailUrl.textContent = password.url || '未設定';
        
        // 備考の表示
        this.detailNotes.textContent = password.notes || '';
        
        this.detailUpdatedAt.textContent = password.updatedAt;
        
        // ボタンにIDを保存
        this.detailToggleBtn.dataset.id = password.id;
        this.detailUpdateBtn.dataset.id = password.id;
        this.detailEditBtn.dataset.id = password.id;
        this.detailDeleteBtn.dataset.id = password.id;
        
        toggleModal(this.detailModal, true);
    }
    
    hideDetailModal() {
        toggleModal(this.detailModal, false);
        this.isPasswordVisible = false;
        this.currentPassword = '';
    }
    
    showSettingsModal() {
        // ダークモードの状態を同期
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
        }
        toggleModal(this.settingsModal, true);
    }
    
    hideSettingsModal() {
        toggleModal(this.settingsModal, false);
    }
    
    togglePasswordVisibility() {
        if (this.isPasswordVisible) {
            this.detailPassword.textContent = '••••••••';
            this.detailToggleBtn.textContent = '👁️ 表示';
            this.isPasswordVisible = false;
        } else {
            this.detailPassword.textContent = this.currentPassword;
            this.detailToggleBtn.textContent = '🙈 非表示';
            this.isPasswordVisible = true;
        }
    }
    
    generatePasswordHandler() {
        const settings = getPasswordGenerationSettings();
        this.passwordInput.value = generatePassword(settings.charType, settings.length);
    }
    
    setupForAdd() {
        this.editingId = null;
        this.modalTitle.textContent = '新規パスワード';
        this.entryNameInput.disabled = false;
        this.usernameInput.disabled = false;
        this.notesInput.value = '';
        this.notesInput.disabled = false;
        this.showMainModal();
    }
    
    setupForUpdate(password) {
        this.editingId = 'update-' + password.id;
        this.modalTitle.textContent = 'パスワード更新';
        this.entryNameInput.value = password.entryName;
        this.entryNameInput.disabled = true;
        this.usernameInput.value = password.username;
        this.usernameInput.disabled = true;
        this.urlInput.value = password.url || '';
        this.urlInput.disabled = true;
        this.notesInput.value = password.notes || '';
        this.notesInput.disabled = true;
        const settings = getPasswordGenerationSettings();
        this.passwordInput.value = generatePassword(settings.charType, settings.length);
        this.showMainModal();
    }
    
    setupForEdit(password) {
        this.editingId = password.id;
        this.modalTitle.textContent = 'パスワード編集';
        this.entryNameInput.value = password.entryName;
        this.entryNameInput.disabled = false;
        this.usernameInput.value = password.username;
        this.usernameInput.disabled = false;
        this.urlInput.value = password.url || '';
        this.urlInput.disabled = false;
        this.passwordInput.value = password.password;
        this.notesInput.value = password.notes || '';
        this.notesInput.disabled = false;
        this.showMainModal();
    }
}

export { ModalManager };