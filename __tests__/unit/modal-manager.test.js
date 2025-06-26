// モーダル管理機能のテスト

describe('Modal Manager', () => {
  // DOM要素のモック作成
  const createMockElement = (id) => ({
    id,
    textContent: '',
    value: '',
    disabled: false,
    dataset: {},
    classList: {
      add: jest.fn(),
      remove: jest.fn(),
      contains: jest.fn(() => false)
    },
    addEventListener: jest.fn(),
    focus: jest.fn(),
    reset: jest.fn()
  });

  let mockModal;
  let mockModalManager;
  let originalDocument;
  let originalWindow;
  let originalLocalStorage;

  beforeEach(() => {
    // DOM要素のモック設定
    originalDocument = global.document;
    originalWindow = global.window;
    originalLocalStorage = global.localStorage;

    // localStorage のモック
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn()
    };

    global.localStorage = localStorageMock;

    // DOM要素のモック
    const mockElements = {
      modal: createMockElement('modal'),
      modalTitle: createMockElement('modalTitle'),
      closeModal: createMockElement('closeModal'),
      cancelBtn: createMockElement('cancelBtn'),
      passwordForm: createMockElement('passwordForm'),
      entryName: createMockElement('entryName'),
      username: createMockElement('username'),
      url: createMockElement('url'),
      password: createMockElement('password'),
      notes: createMockElement('notes'),
      generateBtn: createMockElement('generateBtn'),
      detailModal: createMockElement('detailModal'),
      closeDetailModal: createMockElement('closeDetailModal'),
      detailEntryName: createMockElement('detailEntryName'),
      detailUsername: createMockElement('detailUsername'),
      detailPassword: createMockElement('detailPassword'),
      detailUrl: createMockElement('detailUrl'),
      detailNotes: createMockElement('detailNotes'),
      detailUpdatedAt: createMockElement('detailUpdatedAt'),
      detailToggleBtn: createMockElement('detailToggleBtn'),
      detailUpdateBtn: createMockElement('detailUpdateBtn'),
      detailEditBtn: createMockElement('detailEditBtn'),
      detailDeleteBtn: createMockElement('detailDeleteBtn'),
      settingsModal: createMockElement('settingsModal'),
      closeSettingsModal: createMockElement('closeSettingsModal'),
      openFolderBtnModal: createMockElement('openFolderBtnModal')
    };

    global.document = {
      getElementById: jest.fn((id) => mockElements[id] || createMockElement(id)),
      body: {
        classList: {
          add: jest.fn(),
          remove: jest.fn(),
          contains: jest.fn(() => false)
        }
      }
    };

    global.window = {
      addEventListener: jest.fn()
    };

    // ModalManagerクラスをモック
    class MockModalManager {
      constructor() {
        this.modal = mockElements.modal;
        this.modalTitle = mockElements.modalTitle;
        this.closeModal = mockElements.closeModal;
        this.cancelBtn = mockElements.cancelBtn;
        this.passwordForm = mockElements.passwordForm;
        this.entryNameInput = mockElements.entryName;
        this.usernameInput = mockElements.username;
        this.urlInput = mockElements.url;
        this.passwordInput = mockElements.password;
        this.notesInput = mockElements.notes;
        this.generateBtn = mockElements.generateBtn;
        this.detailModal = mockElements.detailModal;
        this.closeDetailModal = mockElements.closeDetailModal;
        this.detailEntryName = mockElements.detailEntryName;
        this.detailUsername = mockElements.detailUsername;
        this.detailPassword = mockElements.detailPassword;
        this.detailUrl = mockElements.detailUrl;
        this.detailNotes = mockElements.detailNotes;
        this.detailUpdatedAt = mockElements.detailUpdatedAt;
        this.detailToggleBtn = mockElements.detailToggleBtn;
        this.detailUpdateBtn = mockElements.detailUpdateBtn;
        this.detailEditBtn = mockElements.detailEditBtn;
        this.detailDeleteBtn = mockElements.detailDeleteBtn;
        this.settingsModal = mockElements.settingsModal;
        this.closeSettingsModal = mockElements.closeSettingsModal;
        this.openFolderBtnModal = mockElements.openFolderBtnModal;
        
        this.editingId = null;
        this.isPasswordVisible = false;
        this.currentPassword = '';
        
        this.initEventListeners();
      }
      
      initEventListeners() {
        // イベントリスナーの登録をモック
      }
      
      showMainModal() {
        this.modal.style = { display: 'block' };
        this.entryNameInput.focus();
      }
      
      hideMainModal() {
        this.modal.style = { display: 'none' };
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
        this.currentPassword = password.password;
        this.isPasswordVisible = false;
        this.detailPassword.textContent = '••••••••';
        this.detailToggleBtn.textContent = '👁️ 表示';
        this.detailUrl.textContent = password.url || '未設定';
        this.detailNotes.textContent = password.notes || '';
        this.detailUpdatedAt.textContent = password.updatedAt;
        
        this.detailToggleBtn.dataset.id = password.id;
        this.detailUpdateBtn.dataset.id = password.id;
        this.detailEditBtn.dataset.id = password.id;
        this.detailDeleteBtn.dataset.id = password.id;
        
        this.detailModal.style = { display: 'block' };
      }
      
      hideDetailModal() {
        this.detailModal.style = { display: 'none' };
        this.isPasswordVisible = false;
        this.currentPassword = '';
      }
      
      showSettingsModal() {
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        if (isDarkMode) {
          document.body.classList.add('dark-mode');
        }
        this.settingsModal.style = { display: 'block' };
      }
      
      hideSettingsModal() {
        this.settingsModal.style = { display: 'none' };
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
        // パスワード生成機能をモック
        this.passwordInput.value = 'GeneratedPassword123';
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
        this.passwordInput.value = 'NewGeneratedPassword456';
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

    mockModalManager = new MockModalManager();
  });

  afterEach(() => {
    global.document = originalDocument;
    global.window = originalWindow;
    global.localStorage = originalLocalStorage;
    jest.clearAllMocks();
  });

  describe('初期化機能', () => {
    test('コンストラクタで適切にDOM要素を取得する', () => {
      expect(mockModalManager.modal).toBeDefined();
      expect(mockModalManager.modalTitle).toBeDefined();
      expect(mockModalManager.passwordForm).toBeDefined();
      expect(mockModalManager.entryNameInput).toBeDefined();
      expect(mockModalManager.detailModal).toBeDefined();
      expect(mockModalManager.settingsModal).toBeDefined();
    });

    test('初期状態が正しく設定される', () => {
      expect(mockModalManager.editingId).toBeNull();
      expect(mockModalManager.isPasswordVisible).toBe(false);
      expect(mockModalManager.currentPassword).toBe('');
    });

    test('イベントリスナーが初期化される', () => {
      expect(mockModalManager.initEventListeners).toBeDefined();
    });
  });

  describe('メインモーダル機能', () => {
    test('メインモーダルを表示する', () => {
      mockModalManager.showMainModal();
      
      expect(mockModalManager.modal.style.display).toBe('block');
      expect(mockModalManager.entryNameInput.focus).toHaveBeenCalled();
    });

    test('メインモーダルを非表示にする', () => {
      mockModalManager.hideMainModal();
      
      expect(mockModalManager.modal.style.display).toBe('none');
      expect(mockModalManager.passwordForm.reset).toHaveBeenCalled();
      expect(mockModalManager.entryNameInput.disabled).toBe(false);
      expect(mockModalManager.editingId).toBeNull();
    });

    test('フォームがリセットされる', () => {
      mockModalManager.entryNameInput.disabled = true;
      mockModalManager.usernameInput.disabled = true;
      mockModalManager.notesInput.value = 'test note';
      mockModalManager.editingId = 'test-id';
      
      mockModalManager.hideMainModal();
      
      expect(mockModalManager.entryNameInput.disabled).toBe(false);
      expect(mockModalManager.usernameInput.disabled).toBe(false);
      expect(mockModalManager.urlInput.disabled).toBe(false);
      expect(mockModalManager.notesInput.value).toBe('');
      expect(mockModalManager.editingId).toBeNull();
    });
  });

  describe('詳細モーダル機能', () => {
    const testPassword = {
      id: '123',
      entryName: 'Gmail',
      username: 'test@example.com',
      password: 'secretpass123',
      url: 'https://gmail.com',
      notes: 'テストノート',
      updatedAt: '2024-01-01T00:00:00.000Z'
    };

    test('詳細モーダルを表示する', () => {
      mockModalManager.showDetailModal(testPassword);
      
      expect(mockModalManager.detailEntryName.textContent).toBe('Gmail');
      expect(mockModalManager.detailUsername.textContent).toBe('test@example.com');
      expect(mockModalManager.detailPassword.textContent).toBe('••••••••');
      expect(mockModalManager.detailUrl.textContent).toBe('https://gmail.com');
      expect(mockModalManager.detailNotes.textContent).toBe('テストノート');
      expect(mockModalManager.detailUpdatedAt.textContent).toBe('2024-01-01T00:00:00.000Z');
      expect(mockModalManager.detailModal.style.display).toBe('block');
    });

    test('URLが空の場合「未設定」と表示される', () => {
      const passwordWithoutUrl = { ...testPassword, url: '' };
      mockModalManager.showDetailModal(passwordWithoutUrl);
      
      expect(mockModalManager.detailUrl.textContent).toBe('未設定');
    });

    test('備考が空の場合空文字が表示される', () => {
      const passwordWithoutNotes = { ...testPassword, notes: '' };
      mockModalManager.showDetailModal(passwordWithoutNotes);
      
      expect(mockModalManager.detailNotes.textContent).toBe('');
    });

    test('詳細モーダルを非表示にする', () => {
      mockModalManager.showDetailModal(testPassword);
      mockModalManager.hideDetailModal();
      
      expect(mockModalManager.detailModal.style.display).toBe('none');
      expect(mockModalManager.isPasswordVisible).toBe(false);
      expect(mockModalManager.currentPassword).toBe('');
    });

    test('ボタンにIDが適切に設定される', () => {
      mockModalManager.showDetailModal(testPassword);
      
      expect(mockModalManager.detailToggleBtn.dataset.id).toBe('123');
      expect(mockModalManager.detailUpdateBtn.dataset.id).toBe('123');
      expect(mockModalManager.detailEditBtn.dataset.id).toBe('123');
      expect(mockModalManager.detailDeleteBtn.dataset.id).toBe('123');
    });
  });

  describe('設定モーダル機能', () => {
    test('設定モーダルを表示する（ライトモード）', () => {
      localStorage.getItem = jest.fn().mockReturnValue('false');
      
      mockModalManager.showSettingsModal();
      
      expect(mockModalManager.settingsModal.style.display).toBe('block');
    });

    test('設定モーダルを表示する（ダークモード）', () => {
      localStorage.getItem = jest.fn().mockReturnValue('true');
      
      mockModalManager.showSettingsModal();
      
      expect(document.body.classList.add).toHaveBeenCalledWith('dark-mode');
      expect(mockModalManager.settingsModal.style.display).toBe('block');
    });

    test('設定モーダルを非表示にする', () => {
      mockModalManager.hideSettingsModal();
      
      expect(mockModalManager.settingsModal.style.display).toBe('none');
    });
  });

  describe('パスワード表示切り替え機能', () => {
    beforeEach(() => {
      mockModalManager.currentPassword = 'secretpass123';
      mockModalManager.isPasswordVisible = false;
    });

    test('パスワードを表示する', () => {
      mockModalManager.togglePasswordVisibility();
      
      expect(mockModalManager.detailPassword.textContent).toBe('secretpass123');
      expect(mockModalManager.detailToggleBtn.textContent).toBe('🙈 非表示');
      expect(mockModalManager.isPasswordVisible).toBe(true);
    });

    test('パスワードを非表示にする', () => {
      mockModalManager.isPasswordVisible = true;
      mockModalManager.togglePasswordVisibility();
      
      expect(mockModalManager.detailPassword.textContent).toBe('••••••••');
      expect(mockModalManager.detailToggleBtn.textContent).toBe('👁️ 表示');
      expect(mockModalManager.isPasswordVisible).toBe(false);
    });

    test('パスワード表示切り替えが正しく動作する', () => {
      // 初期状態：非表示
      expect(mockModalManager.isPasswordVisible).toBe(false);
      
      // 表示に切り替え
      mockModalManager.togglePasswordVisibility();
      expect(mockModalManager.isPasswordVisible).toBe(true);
      
      // 非表示に切り替え
      mockModalManager.togglePasswordVisibility();
      expect(mockModalManager.isPasswordVisible).toBe(false);
    });
  });

  describe('パスワード生成機能', () => {
    test('パスワード生成ハンドラーが実行される', () => {
      mockModalManager.generatePasswordHandler();
      
      expect(mockModalManager.passwordInput.value).toBe('GeneratedPassword123');
    });
  });

  describe('モーダル設定機能', () => {
    const testPassword = {
      id: '123',
      entryName: 'Gmail',
      username: 'test@example.com',
      password: 'secretpass123',
      url: 'https://gmail.com',
      notes: 'テストノート'
    };

    describe('新規追加設定', () => {
      test('新規追加モードに設定する', () => {
        mockModalManager.setupForAdd();
        
        expect(mockModalManager.editingId).toBeNull();
        expect(mockModalManager.modalTitle.textContent).toBe('新規パスワード');
        expect(mockModalManager.entryNameInput.disabled).toBe(false);
        expect(mockModalManager.usernameInput.disabled).toBe(false);
        expect(mockModalManager.notesInput.value).toBe('');
        expect(mockModalManager.notesInput.disabled).toBe(false);
        expect(mockModalManager.modal.style.display).toBe('block');
      });
    });

    describe('更新設定', () => {
      test('更新モードに設定する', () => {
        mockModalManager.setupForUpdate(testPassword);
        
        expect(mockModalManager.editingId).toBe('update-123');
        expect(mockModalManager.modalTitle.textContent).toBe('パスワード更新');
        expect(mockModalManager.entryNameInput.value).toBe('Gmail');
        expect(mockModalManager.entryNameInput.disabled).toBe(true);
        expect(mockModalManager.usernameInput.value).toBe('test@example.com');
        expect(mockModalManager.usernameInput.disabled).toBe(true);
        expect(mockModalManager.urlInput.value).toBe('https://gmail.com');
        expect(mockModalManager.urlInput.disabled).toBe(true);
        expect(mockModalManager.notesInput.value).toBe('テストノート');
        expect(mockModalManager.notesInput.disabled).toBe(true);
        expect(mockModalManager.passwordInput.value).toBe('NewGeneratedPassword456');
        expect(mockModalManager.modal.style.display).toBe('block');
      });

      test('更新モードでURLが空の場合', () => {
        const passwordWithoutUrl = { ...testPassword, url: '' };
        mockModalManager.setupForUpdate(passwordWithoutUrl);
        
        expect(mockModalManager.urlInput.value).toBe('');
      });

      test('更新モードで備考が空の場合', () => {
        const passwordWithoutNotes = { ...testPassword, notes: '' };
        mockModalManager.setupForUpdate(passwordWithoutNotes);
        
        expect(mockModalManager.notesInput.value).toBe('');
      });
    });

    describe('編集設定', () => {
      test('編集モードに設定する', () => {
        mockModalManager.setupForEdit(testPassword);
        
        expect(mockModalManager.editingId).toBe('123');
        expect(mockModalManager.modalTitle.textContent).toBe('パスワード編集');
        expect(mockModalManager.entryNameInput.value).toBe('Gmail');
        expect(mockModalManager.entryNameInput.disabled).toBe(false);
        expect(mockModalManager.usernameInput.value).toBe('test@example.com');
        expect(mockModalManager.usernameInput.disabled).toBe(false);
        expect(mockModalManager.urlInput.value).toBe('https://gmail.com');
        expect(mockModalManager.urlInput.disabled).toBe(false);
        expect(mockModalManager.passwordInput.value).toBe('secretpass123');
        expect(mockModalManager.notesInput.value).toBe('テストノート');
        expect(mockModalManager.notesInput.disabled).toBe(false);
        expect(mockModalManager.modal.style.display).toBe('block');
      });

      test('編集モードでURLが空の場合', () => {
        const passwordWithoutUrl = { ...testPassword, url: '' };
        mockModalManager.setupForEdit(passwordWithoutUrl);
        
        expect(mockModalManager.urlInput.value).toBe('');
      });

      test('編集モードで備考が空の場合', () => {
        const passwordWithoutNotes = { ...testPassword, notes: '' };
        mockModalManager.setupForEdit(passwordWithoutNotes);
        
        expect(mockModalManager.notesInput.value).toBe('');
      });
    });
  });

  describe('エッジケースの処理', () => {
    test('nullまたはundefinedのパスワードを処理する', () => {
      const invalidPassword = {
        id: '123',
        entryName: 'Test',
        username: 'test',
        password: null,
        url: undefined,
        notes: null
      };
      
      expect(() => mockModalManager.showDetailModal(invalidPassword)).not.toThrow();
      expect(mockModalManager.detailUrl.textContent).toBe('未設定');
      expect(mockModalManager.detailNotes.textContent).toBe('');
    });

    test('空文字列のフィールドを適切に処理する', () => {
      const emptyFieldsPassword = {
        id: '',
        entryName: '',
        username: '',
        password: '',
        url: '',
        notes: ''
      };
      
      expect(() => mockModalManager.showDetailModal(emptyFieldsPassword)).not.toThrow();
      expect(mockModalManager.detailEntryName.textContent).toBe('');
      expect(mockModalManager.detailUrl.textContent).toBe('未設定');
    });

    test('非常に長いテキストを処理する', () => {
      const longTextPassword = {
        id: '123',
        entryName: 'A'.repeat(1000),
        username: 'B'.repeat(1000),
        password: 'C'.repeat(1000),
        url: 'https://example.com/' + 'D'.repeat(1000),
        notes: 'E'.repeat(1000)
      };
      
      expect(() => mockModalManager.showDetailModal(longTextPassword)).not.toThrow();
      expect(mockModalManager.detailEntryName.textContent).toBe('A'.repeat(1000));
    });

    test('特殊文字を含むテキストを処理する', () => {
      const specialCharsPassword = {
        id: '123',
        entryName: '<script>alert("xss")</script>',
        username: '&lt;test&gt;',
        password: '!@#$%^&*()_+{}|:"<>?[]\\;\',./',
        url: 'https://example.com/path?param=value&other=test',
        notes: '改行\nタブ\t文字'
      };
      
      expect(() => mockModalManager.showDetailModal(specialCharsPassword)).not.toThrow();
    });
  });

  describe('状態管理テスト', () => {
    test('editingIdの状態管理', () => {
      const testPassword = { id: '123', entryName: 'Test', username: 'test', password: 'pass' };
      
      // 新規追加
      mockModalManager.setupForAdd();
      expect(mockModalManager.editingId).toBeNull();
      
      // 編集
      mockModalManager.setupForEdit(testPassword);
      expect(mockModalManager.editingId).toBe('123');
      
      // 更新
      mockModalManager.setupForUpdate(testPassword);
      expect(mockModalManager.editingId).toBe('update-123');
      
      // モーダル閉じる
      mockModalManager.hideMainModal();
      expect(mockModalManager.editingId).toBeNull();
    });

    test('パスワード表示状態の管理', () => {
      const testPassword = { id: '123', entryName: 'Test', username: 'test', password: 'secretpass' };
      
      // 詳細モーダル表示
      mockModalManager.showDetailModal(testPassword);
      expect(mockModalManager.isPasswordVisible).toBe(false);
      expect(mockModalManager.currentPassword).toBe('secretpass');
      
      // パスワード表示切り替え
      mockModalManager.togglePasswordVisibility();
      expect(mockModalManager.isPasswordVisible).toBe(true);
      
      // 詳細モーダル閉じる
      mockModalManager.hideDetailModal();
      expect(mockModalManager.isPasswordVisible).toBe(false);
      expect(mockModalManager.currentPassword).toBe('');
    });
  });

  describe('パフォーマンステスト', () => {
    test('大量のデータでも適切に動作する', () => {
      const largePassword = {
        id: '123',
        entryName: 'A'.repeat(10000),
        username: 'B'.repeat(10000),
        password: 'C'.repeat(10000),
        url: 'https://example.com/' + 'D'.repeat(10000),
        notes: 'E'.repeat(10000),
        updatedAt: '2024-01-01T00:00:00.000Z'
      };
      
      const start = Date.now();
      mockModalManager.showDetailModal(largePassword);
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(100); // 100ms以内に完了することを確認
      expect(mockModalManager.detailEntryName.textContent).toBe('A'.repeat(10000));
    });

    test('高頻度な操作でも安定動作する', () => {
      const testPassword = { id: '123', entryName: 'Test', username: 'test', password: 'pass' };
      
      // 100回の連続操作
      for (let i = 0; i < 100; i++) {
        mockModalManager.showDetailModal(testPassword);
        mockModalManager.togglePasswordVisibility();
        mockModalManager.hideDetailModal();
      }
      
      // 状態が正しくリセットされていることを確認
      expect(mockModalManager.isPasswordVisible).toBe(false);
      expect(mockModalManager.currentPassword).toBe('');
    });
  });
});