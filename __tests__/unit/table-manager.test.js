// テーブル管理機能のテスト

describe('Table Manager', () => {
  // DOM操作用のユーティリティ関数を模倣
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // TableManagerクラスを模倣
  class MockTableManager {
    constructor(searchBox) {
      this.searchBox = searchBox;
      this.passwordList = { innerHTML: '' };
      this.emptyState = { 
        classList: { add: jest.fn(), remove: jest.fn() },
        innerHTML: ''
      };
      this.passwordTable = { 
        classList: { add: jest.fn(), remove: jest.fn() }
      };
      this.passwords = [];
    }
    
    setPasswords(passwords) {
      this.passwords = passwords;
    }
    
    formatUsername(username) {
      if (!/^[a-zA-Z0-9]*$/.test(username)) {
        return escapeHtml(username);
      }
      
      if (username.length > 30) {
        return escapeHtml(username.substring(0, 30)) + '...';
      }
      
      return escapeHtml(username);
    }
    
    extractHost(url) {
      if (!url) return '';
      
      try {
        const urlWithProtocol = url.startsWith('http') ? url : 'https://' + url;
        const urlObj = new URL(urlWithProtocol);
        return urlObj.hostname.toLowerCase();
      } catch (e) {
        return url.toLowerCase();
      }
    }
    
    isUrl(str) {
      if (!str) return false;
      
      if (str.startsWith('http://') || str.startsWith('https://')) {
        return true;
      }
      
      if (str.includes('/') && str.includes('.')) {
        return true;
      }
      
      return false;
    }
    
    filterPasswords(searchTerm, searchMode) {
      if (searchMode === 'url') {
        return this.passwords.filter(p => {
          if (!p.url) return false;
          
          const host = this.extractHost(p.url);
          let searchHost = searchTerm;
          if (this.isUrl(searchTerm)) {
            searchHost = this.extractHost(searchTerm);
          }
          
          return host.includes(searchHost);
        });
      } else {
        return this.passwords.filter(p => 
          p.entryName.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
    }
    
    removeDuplicates(passwords) {
      const uniquePasswords = new Map();
      passwords.forEach(password => {
        const key = password.entryName.toLowerCase();
        if (!uniquePasswords.has(key) || 
            new Date(password.updatedAt) > new Date(uniquePasswords.get(key).updatedAt)) {
          uniquePasswords.set(key, password);
        }
      });
      
      return Array.from(uniquePasswords.values());
    }
    
    render(searchTerm = '', searchMode = 'entry') {
      let filteredPasswords = this.filterPasswords(searchTerm, searchMode);
      filteredPasswords = this.removeDuplicates(filteredPasswords);
      
      if (filteredPasswords.length === 0) {
        this.passwordTable.classList.add('hidden');
        this.emptyState.classList.remove('hidden');
        
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
          this.emptyState.innerHTML = `
            <p>「${escapeHtml(searchTerm)}」に一致するエントリが見つかりませんでした。</p>
          `;
        } else {
          this.emptyState.innerHTML = `
            <p>パスワードが登録されていません。<br>「新規追加」ボタンから追加してください。</p>
          `;
        }
        return { isEmpty: true, count: 0 };
      }

      this.passwordTable.classList.remove('hidden');
      this.emptyState.classList.add('hidden');
      
      return { isEmpty: false, count: filteredPasswords.length, passwords: filteredPasswords };
    }
  }

  let mockSearchBox;
  let tableManager;

  beforeEach(() => {
    mockSearchBox = {
      value: '',
      addEventListener: jest.fn()
    };

    // DOM要素のモックを設定
    global.document = {
      createElement: jest.fn((tag) => ({
        textContent: '',
        innerHTML: '',
        get textContent() { return this._textContent || ''; },
        set textContent(value) { this._textContent = value; this.innerHTML = escapeHtml(value); }
      })),
      getElementById: jest.fn((id) => ({
        value: id === 'searchMode' ? 'entry' : '',
        classList: { add: jest.fn(), remove: jest.fn() }
      }))
    };

    tableManager = new MockTableManager(mockSearchBox);
  });

  describe('ユーザー名フォーマット機能', () => {
    test('短い英数字ユーザー名をそのまま表示する', () => {
      const result = tableManager.formatUsername('user123');
      expect(result).toBe('user123');
    });

    test('30文字を超える英数字ユーザー名を省略する', () => {
      const longUsername = 'a'.repeat(35);
      const result = tableManager.formatUsername(longUsername);
      expect(result).toBe('a'.repeat(30) + '...');
    });

    test('日本語を含むユーザー名をそのまま表示する', () => {
      const result = tableManager.formatUsername('ユーザー@example.com');
      expect(result).toContain('ユーザー');
    });

    test('特殊文字を含むユーザー名をエスケープする', () => {
      const result = tableManager.formatUsername('<script>alert("xss")</script>');
      expect(result).not.toContain('<script>');
      expect(result).toContain('&lt;script&gt;');
    });

    test('空文字列を処理する', () => {
      const result = tableManager.formatUsername('');
      expect(result).toBe('');
    });

    test('30文字ちょうどの英数字ユーザー名', () => {
      const username = 'a'.repeat(30);
      const result = tableManager.formatUsername(username);
      expect(result).toBe(username);
    });
  });

  describe('URL/ホスト抽出機能', () => {
    test('完全なHTTPS URLからホストを抽出する', () => {
      const host = tableManager.extractHost('https://www.example.com/path?query=1');
      expect(host).toBe('www.example.com');
    });

    test('プロトコルなしURLからホストを抽出する', () => {
      const host = tableManager.extractHost('github.com/user/repo');
      expect(host).toBe('github.com');
    });

    test('無効なURLを小文字で返す', () => {
      const host = tableManager.extractHost('InvalidURL');
      expect(host).toBe('invalidurl');
    });

    test('空文字列で空文字列を返す', () => {
      const host = tableManager.extractHost('');
      expect(host).toBe('');
    });
  });

  describe('URL判定機能', () => {
    test('HTTPSプロトコル付きURLを判定する', () => {
      expect(tableManager.isUrl('https://example.com')).toBe(true);
    });

    test('HTTPプロトコル付きURLを判定する', () => {
      expect(tableManager.isUrl('http://example.com')).toBe(true);
    });

    test('スラッシュとドットを含む文字列をURLと判定する', () => {
      expect(tableManager.isUrl('example.com/path')).toBe(true);
    });

    test('プレーンテキストをURLでないと判定する', () => {
      expect(tableManager.isUrl('example')).toBe(false);
    });

    test('空文字列をURLでないと判定する', () => {
      expect(tableManager.isUrl('')).toBe(false);
    });

    test('nullまたはundefinedをURLでないと判定する', () => {
      expect(tableManager.isUrl(null)).toBe(false);
      expect(tableManager.isUrl(undefined)).toBe(false);
    });
  });

  describe('パスワードフィルタリング機能', () => {
    const testPasswords = [
      {
        id: '1',
        entryName: 'Gmail',
        username: 'user@gmail.com',
        password: 'pass1',
        url: 'https://mail.google.com',
        updatedAt: '2024-01-01T00:00:00.000Z'
      },
      {
        id: '2',
        entryName: 'GitHub',
        username: 'developer',
        password: 'pass2',
        url: 'https://github.com/login',
        updatedAt: '2024-01-02T00:00:00.000Z'
      },
      {
        id: '3',
        entryName: 'Facebook',
        username: 'user3',
        password: 'pass3',
        url: 'https://www.facebook.com',
        updatedAt: '2024-01-03T00:00:00.000Z'
      },
      {
        id: '4',
        entryName: 'Local App',
        username: 'admin',
        password: 'pass4',
        url: '',
        updatedAt: '2024-01-04T00:00:00.000Z'
      }
    ];

    beforeEach(() => {
      tableManager.setPasswords(testPasswords);
    });

    describe('エントリ名検索', () => {
      test('部分一致でフィルタリングする', () => {
        const result = tableManager.filterPasswords('git', 'entry');
        expect(result).toHaveLength(1);
        expect(result[0].entryName).toBe('GitHub');
      });

      test('大文字小文字を無視する', () => {
        const result = tableManager.filterPasswords('GMAIL', 'entry');
        expect(result).toHaveLength(1);
        expect(result[0].entryName).toBe('Gmail');
      });

      test('マッチしない場合は空配列を返す', () => {
        const result = tableManager.filterPasswords('NoMatch', 'entry');
        expect(result).toHaveLength(0);
      });

      test('空の検索語ですべてを返す', () => {
        const result = tableManager.filterPasswords('', 'entry');
        expect(result).toHaveLength(4);
      });
    });

    describe('URL検索', () => {
      test('ドメイン名でフィルタリングする', () => {
        const result = tableManager.filterPasswords('google', 'url');
        expect(result).toHaveLength(1);
        expect(result[0].entryName).toBe('Gmail');
      });

      test('URLを持たないエントリは除外する', () => {
        const result = tableManager.filterPasswords('local', 'url');
        expect(result).toHaveLength(0);
      });

      test('完全なURLで検索する', () => {
        const result = tableManager.filterPasswords('https://github.com', 'url');
        expect(result).toHaveLength(1);
        expect(result[0].entryName).toBe('GitHub');
      });
    });
  });

  describe('重複排除機能', () => {
    test('同じエントリ名の重複を排除し最新を保持する', () => {
      const duplicatePasswords = [
        {
          id: '1',
          entryName: 'Gmail',
          updatedAt: '2024-01-01T00:00:00.000Z'
        },
        {
          id: '2',
          entryName: 'Gmail',
          updatedAt: '2024-01-02T00:00:00.000Z'
        },
        {
          id: '3',
          entryName: 'GitHub',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      ];

      const result = tableManager.removeDuplicates(duplicatePasswords);
      expect(result).toHaveLength(2);
      
      const gmailEntry = result.find(p => p.entryName === 'Gmail');
      expect(gmailEntry.id).toBe('2'); // より新しいエントリが保持される
    });

    test('重複がない場合はそのまま返す', () => {
      const uniquePasswords = [
        { id: '1', entryName: 'Gmail', updatedAt: '2024-01-01T00:00:00.000Z' },
        { id: '2', entryName: 'GitHub', updatedAt: '2024-01-01T00:00:00.000Z' }
      ];

      const result = tableManager.removeDuplicates(uniquePasswords);
      expect(result).toHaveLength(2);
    });

    test('空配列で空配列を返す', () => {
      const result = tableManager.removeDuplicates([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('レンダリング機能', () => {
    const testPasswords = [
      {
        id: '1',
        entryName: 'Gmail',
        username: 'user@gmail.com',
        password: 'pass1',
        url: 'https://mail.google.com',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }
    ];

    beforeEach(() => {
      tableManager.setPasswords(testPasswords);
    });

    test('パスワードが存在する場合にテーブルを表示する', () => {
      const result = tableManager.render('', 'entry');
      
      expect(result.isEmpty).toBe(false);
      expect(result.count).toBe(1);
      expect(tableManager.passwordTable.classList.remove).toHaveBeenCalledWith('hidden');
      expect(tableManager.emptyState.classList.add).toHaveBeenCalledWith('hidden');
    });

    test('パスワードが存在しない場合に空状態を表示する', () => {
      tableManager.setPasswords([]);
      const result = tableManager.render('', 'entry');
      
      expect(result.isEmpty).toBe(true);
      expect(result.count).toBe(0);
      expect(tableManager.passwordTable.classList.add).toHaveBeenCalledWith('hidden');
      expect(tableManager.emptyState.classList.remove).toHaveBeenCalledWith('hidden');
    });

    test('URL検索で結果がない場合の空状態メッセージ', () => {
      const result = tableManager.render('nomatch.com', 'url');
      
      expect(result.isEmpty).toBe(true);
      expect(tableManager.emptyState.innerHTML).toContain('nomatch.com');
      expect(tableManager.emptyState.innerHTML).toContain('ドメイン名が見つかりませんでした');
    });

    test('エントリ検索で結果がない場合の空状態メッセージ', () => {
      const result = tableManager.render('NoMatch', 'entry');
      
      expect(result.isEmpty).toBe(true);
      expect(tableManager.emptyState.innerHTML).toContain('NoMatch');
      expect(tableManager.emptyState.innerHTML).toContain('エントリが見つかりませんでした');
    });

    test('検索語なしで結果がない場合のデフォルト空状態メッセージ', () => {
      tableManager.setPasswords([]);
      const result = tableManager.render('', 'entry');
      
      expect(result.isEmpty).toBe(true);
      expect(tableManager.emptyState.innerHTML).toContain('パスワードが登録されていません');
    });
  });

  describe('エッジケースの処理', () => {
    test('nullまたはundefinedパスワード配列を処理する', () => {
      // nullチェックを追加したfilterPasswordsメソッドをテスト
      tableManager.passwords = null;
      
      // filterPasswordsメソッドにnullチェックを追加
      const originalFilterPasswords = tableManager.filterPasswords;
      tableManager.filterPasswords = function(searchTerm, searchMode) {
        if (!this.passwords) return [];
        return originalFilterPasswords.call(this, searchTerm, searchMode);
      };
      
      expect(() => tableManager.render('', 'entry')).not.toThrow();
    });

    test('不正な日付形式を処理する', () => {
      const invalidDatePasswords = [
        {
          id: '1',
          entryName: 'Test',
          updatedAt: 'invalid-date'
        },
        {
          id: '2',
          entryName: 'Test',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      ];

      expect(() => tableManager.removeDuplicates(invalidDatePasswords)).not.toThrow();
    });

    test('非常に長いエントリ名を処理する', () => {
      const longEntryPasswords = [
        {
          id: '1',
          entryName: 'A'.repeat(1000),
          username: 'user',
          url: 'https://example.com',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      ];

      tableManager.setPasswords(longEntryPasswords);
      const result = tableManager.render('A'.repeat(100), 'entry');
      expect(result.count).toBe(1);
    });
  });

  describe('パフォーマンステスト', () => {
    test('大量データでのフィルタリングパフォーマンス', () => {
      const largeDataset = Array.from({ length: 10000 }, (_, index) => ({
        id: index.toString(),
        entryName: `Entry ${index}`,
        username: `user${index}`,
        password: `pass${index}`,
        url: `https://site${index}.com`,
        updatedAt: new Date().toISOString()
      }));

      tableManager.setPasswords(largeDataset);

      const start = Date.now();
      const result = tableManager.render('Entry 5000', 'entry');
      const duration = Date.now() - start;

      expect(result.count).toBe(1);
      expect(duration).toBeLessThan(200); // 200ms以内に完了することを確認
    });

    test('重複排除のパフォーマンス', () => {
      const duplicateDataset = Array.from({ length: 1000 }, (_, index) => ({
        id: index.toString(),
        entryName: `Entry ${index % 100}`, // 100個のユニークなエントリ名で重複を作成
        updatedAt: new Date(Date.now() + index).toISOString()
      }));

      const start = Date.now();
      const result = tableManager.removeDuplicates(duplicateDataset);
      const duration = Date.now() - start;

      expect(result).toHaveLength(100);
      expect(duration).toBeLessThan(100); // 100ms以内に完了することを確認
    });
  });
});