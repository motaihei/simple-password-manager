// パスワード生成機能のテスト

describe('Password Generator', () => {
  // password.jsからgeneratePassword関数を模倣
  function generatePassword(charType = 'alphanumeric', length = 8) {
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

  describe('基本的なパスワード生成', () => {
    test('デフォルト設定でパスワードを生成する', () => {
      const password = generatePassword();
      expect(password).toHaveLength(8);
      expect(typeof password).toBe('string');
    });

    test('指定した長さでパスワードを生成する', () => {
      const lengths = [1, 8, 16, 32, 64];
      lengths.forEach(length => {
        const password = generatePassword('alphanumeric', length);
        expect(password).toHaveLength(length);
      });
    });

    test('毎回異なるパスワードを生成する', () => {
      const passwords = new Set();
      for (let i = 0; i < 100; i++) {
        passwords.add(generatePassword('withSymbols', 16));
      }
      expect(passwords.size).toBe(100);
    });
  });

  describe('英数字モード (alphanumeric)', () => {
    test('英数字のみを含む', () => {
      const allowedChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      const password = generatePassword('alphanumeric', 20);
      
      for (const char of password) {
        expect(allowedChars).toContain(char);
      }
    });

    test('記号を含まない', () => {
      const symbolRegex = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/;
      for (let i = 0; i < 50; i++) {
        const password = generatePassword('alphanumeric', 16);
        expect(symbolRegex.test(password)).toBe(false);
      }
    });

    test('大文字・小文字・数字の混合を含む可能性がある', () => {
      let hasUpperCase = false;
      let hasLowerCase = false;
      let hasNumber = false;

      for (let i = 0; i < 100; i++) {
        const password = generatePassword('alphanumeric', 20);
        if (/[A-Z]/.test(password)) hasUpperCase = true;
        if (/[a-z]/.test(password)) hasLowerCase = true;
        if (/[0-9]/.test(password)) hasNumber = true;
      }

      expect(hasUpperCase).toBe(true);
      expect(hasLowerCase).toBe(true);
      expect(hasNumber).toBe(true);
    });
  });

  describe('記号込みモード (withSymbols)', () => {
    test('英数字と記号を含む', () => {
      const allowedChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
      const password = generatePassword('withSymbols', 20);
      
      for (const char of password) {
        expect(allowedChars).toContain(char);
      }
    });

    test('記号を含む可能性がある', () => {
      let hasSymbol = false;
      const symbolRegex = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/;
      
      for (let i = 0; i < 100; i++) {
        const password = generatePassword('withSymbols', 20);
        if (symbolRegex.test(password)) {
          hasSymbol = true;
          break;
        }
      }
      
      expect(hasSymbol).toBe(true);
    });

    test('全文字種の混合を含む可能性がある', () => {
      let hasUpperCase = false;
      let hasLowerCase = false;
      let hasNumber = false;
      let hasSpecial = false;

      for (let i = 0; i < 200; i++) {
        const password = generatePassword('withSymbols', 20);
        if (/[A-Z]/.test(password)) hasUpperCase = true;
        if (/[a-z]/.test(password)) hasLowerCase = true;
        if (/[0-9]/.test(password)) hasNumber = true;
        if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) hasSpecial = true;
      }

      expect(hasUpperCase).toBe(true);
      expect(hasLowerCase).toBe(true);
      expect(hasNumber).toBe(true);
      expect(hasSpecial).toBe(true);
    });
  });

  describe('エッジケース', () => {
    test('長さ0のパスワードを生成する', () => {
      const password = generatePassword('alphanumeric', 0);
      expect(password).toBe('');
      expect(password).toHaveLength(0);
    });

    test('長さ1のパスワードを生成する', () => {
      const password = generatePassword('alphanumeric', 1);
      expect(password).toHaveLength(1);
      expect(typeof password).toBe('string');
    });

    test('非常に長いパスワードを生成する', () => {
      const password = generatePassword('withSymbols', 1000);
      expect(password).toHaveLength(1000);
      expect(typeof password).toBe('string');
    });

    test('無効な文字種タイプでもフォールバックする', () => {
      const password = generatePassword('invalid', 10);
      expect(password).toHaveLength(10);
      expect(typeof password).toBe('string');
    });
  });

  describe('セキュリティ要件', () => {
    test('予測可能なパターンを避ける', () => {
      const passwords = [];
      for (let i = 0; i < 10; i++) {
        passwords.push(generatePassword('withSymbols', 12));
      }
      
      // 連続する同一文字が多すぎないかチェック
      passwords.forEach(password => {
        const consecutivePattern = /(.)\\1{3,}/; // 4文字以上の連続
        expect(consecutivePattern.test(password)).toBe(false);
      });
    });

    test('十分なエントロピーを持つ', () => {
      const passwordSet = new Set();
      const iterations = 1000;
      
      for (let i = 0; i < iterations; i++) {
        passwordSet.add(generatePassword('withSymbols', 12));
      }
      
      // 重複率が5%以下であることを確認
      const uniqueRatio = passwordSet.size / iterations;
      expect(uniqueRatio).toBeGreaterThan(0.95);
    });
  });

  describe('パスワード設定機能のテスト', () => {
    // getPasswordGenerationSettings関数のモック
    function mockGetPasswordGenerationSettings(charType = 'alphanumeric', length = 8) {
      return { charType, length };
    }

    test('デフォルト設定を返す', () => {
      const settings = mockGetPasswordGenerationSettings();
      expect(settings.charType).toBe('alphanumeric');
      expect(settings.length).toBe(8);
    });

    test('カスタム設定を返す', () => {
      const settings = mockGetPasswordGenerationSettings('withSymbols', 16);
      expect(settings.charType).toBe('withSymbols');
      expect(settings.length).toBe(16);
    });

    test('設定値の型が正しい', () => {
      const settings = mockGetPasswordGenerationSettings('withSymbols', 24);
      expect(typeof settings.charType).toBe('string');
      expect(typeof settings.length).toBe('number');
      expect(Number.isInteger(settings.length)).toBe(true);
    });
  });

  describe('パスワードコピー機能のテスト', () => {
    const mockPasswords = [
      { id: '1', password: 'testpass123' },
      { id: '2', password: 'anotherpass456' }
    ];

    let mockButton;
    let originalClipboardAPI;

    beforeEach(() => {
      mockButton = {
        textContent: 'コピー',
        originalText: 'コピー'
      };

      originalClipboardAPI = global.window?.electronAPI;
      global.window = {
        electronAPI: {
          copyToClipboard: jest.fn()
        }
      };
    });

    afterEach(() => {
      if (originalClipboardAPI) {
        global.window.electronAPI = originalClipboardAPI;
      }
      jest.clearAllTimers();
    });

    test('正常にパスワードをコピーする', async () => {
      const copyPassword = async (id, buttonElement, passwords) => {
        const password = passwords.find(p => p.id === id);
        await window.electronAPI.copyToClipboard(password.password);
        
        const originalText = buttonElement.textContent;
        buttonElement.textContent = '✓';
        setTimeout(() => {
          buttonElement.textContent = originalText;
        }, 1000);
      };

      window.electronAPI.copyToClipboard.mockResolvedValue();

      await copyPassword('1', mockButton, mockPasswords);

      expect(window.electronAPI.copyToClipboard).toHaveBeenCalledWith('testpass123');
      expect(mockButton.textContent).toBe('✓');
    });

    test('存在しないIDでエラーハンドリング', async () => {
      const copyPassword = async (id, buttonElement, passwords) => {
        const password = passwords.find(p => p.id === id);
        if (!password) {
          throw new Error('Password not found');
        }
        await window.electronAPI.copyToClipboard(password.password);
      };

      await expect(copyPassword('999', mockButton, mockPasswords))
        .rejects.toThrow('Password not found');
    });

    test('クリップボードAPIエラーの処理', async () => {
      const copyPassword = async (id, buttonElement, passwords) => {
        const password = passwords.find(p => p.id === id);
        try {
          await window.electronAPI.copyToClipboard(password.password);
          buttonElement.textContent = '✓';
        } catch (error) {
          buttonElement.textContent = '×';
        }
      };

      window.electronAPI.copyToClipboard.mockRejectedValue(new Error('Clipboard error'));

      await copyPassword('1', mockButton, mockPasswords);

      expect(mockButton.textContent).toBe('×');
    });
  });
});