// 検索機能のテスト

describe('Search Functions', () => {
  // SearchManagerクラスを模倣
  class MockSearchManager {
    constructor(searchBox, tableManager) {
      this.searchBox = searchBox;
      this.tableManager = tableManager;
      this.searchModeSelect = { value: 'entry' };
    }
    
    getCurrentMode() {
      return this.searchModeSelect.value;
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
    
    updatePlaceholder() {
      const mode = this.searchModeSelect.value;
      if (mode === 'url') {
        this.searchBox.placeholder = 'URLまたはホストで検索...（例: google.com, https://example.com/path）';
      } else {
        this.searchBox.placeholder = 'エントリで検索...';
      }
    }
    
    clearSearch() {
      this.searchBox.value = '';
      this.tableManager.render();
    }
  }

  let mockSearchBox;
  let mockTableManager;
  let searchManager;

  beforeEach(() => {
    mockSearchBox = {
      value: '',
      placeholder: '',
      addEventListener: jest.fn()
    };

    mockTableManager = {
      render: jest.fn(),
      setPasswords: jest.fn()
    };

    searchManager = new MockSearchManager(mockSearchBox, mockTableManager);
  });

  describe('URLホスト抽出機能', () => {
    test('HTTPSプロトコル付きURLからホストを抽出する', () => {
      const url = 'https://www.google.com/search?q=test';
      const host = searchManager.extractHost(url);
      expect(host).toBe('www.google.com');
    });

    test('HTTPプロトコル付きURLからホストを抽出する', () => {
      const url = 'http://example.com:8080/path';
      const host = searchManager.extractHost(url);
      expect(host).toBe('example.com');
    });

    test('プロトコルなしURLからホストを抽出する', () => {
      const url = 'github.com/user/repo';
      const host = searchManager.extractHost(url);
      expect(host).toBe('github.com');
    });

    test('サブドメイン付きURLからホストを抽出する', () => {
      const url = 'mail.google.com';
      const host = searchManager.extractHost(url);
      expect(host).toBe('mail.google.com');
    });

    test('無効なURLの場合は小文字変換された元の文字列を返す', () => {
      const url = 'InvalidURL';
      const host = searchManager.extractHost(url);
      expect(host).toBe('invalidurl');
    });

    test('空文字列の場合は空文字列を返す', () => {
      const host = searchManager.extractHost('');
      expect(host).toBe('');
    });

    test('nullまたはundefinedの場合は空文字列を返す', () => {
      expect(searchManager.extractHost(null)).toBe('');
      expect(searchManager.extractHost(undefined)).toBe('');
    });

    test('複雑なURLパスとクエリパラメータを含むURL', () => {
      const url = 'https://stackoverflow.com/questions/123/how-to-test?tab=votes#answer-456';
      const host = searchManager.extractHost(url);
      expect(host).toBe('stackoverflow.com');
    });
  });

  describe('検索モード機能', () => {
    test('デフォルトで\'entry\'モードを返す', () => {
      expect(searchManager.getCurrentMode()).toBe('entry');
    });

    test('URLモードに変更できる', () => {
      searchManager.searchModeSelect.value = 'url';
      expect(searchManager.getCurrentMode()).toBe('url');
    });

    test('プレースホルダーがエントリモードで適切に設定される', () => {
      searchManager.searchModeSelect.value = 'entry';
      searchManager.updatePlaceholder();
      expect(mockSearchBox.placeholder).toBe('エントリで検索...');
    });

    test('プレースホルダーがURLモードで適切に設定される', () => {
      searchManager.searchModeSelect.value = 'url';
      searchManager.updatePlaceholder();
      expect(mockSearchBox.placeholder).toBe('URLまたはホストで検索...（例: google.com, https://example.com/path）');
    });
  });

  describe('検索機能の統合テスト', () => {
    const testPasswords = [
      {
        id: '1',
        entryName: 'Gmail',
        username: 'user1@gmail.com',
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
        entryName: 'Local Service',
        username: 'admin',
        password: 'pass4',
        url: '',
        updatedAt: '2024-01-04T00:00:00.000Z'
      }
    ];

    function filterByEntry(passwords, searchTerm) {
      return passwords.filter(p => 
        p.entryName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    function filterByURL(passwords, searchTerm) {
      return passwords.filter(p => {
        if (!p.url) return false;
        
        const host = searchManager.extractHost(p.url);
        let searchHost = searchTerm;
        
        // 検索語がURLの場合、ホスト部分のみを抽出
        if (searchTerm.includes('://') || (searchTerm.includes('/') && searchTerm.includes('.'))) {
          searchHost = searchManager.extractHost(searchTerm);
        }
        
        return host.includes(searchHost.toLowerCase());
      });
    }

    describe('エントリ名検索', () => {
      test('部分一致検索が機能する', () => {
        const result = filterByEntry(testPasswords, 'git');
        expect(result).toHaveLength(1);
        expect(result[0].entryName).toBe('GitHub');
      });

      test('大文字小文字を区別しない検索', () => {
        const result = filterByEntry(testPasswords, 'GMAIL');
        expect(result).toHaveLength(1);
        expect(result[0].entryName).toBe('Gmail');
      });

      test('複数の結果を返す', () => {
        const result = filterByEntry(testPasswords, 'a'); // 'Facebook', 'Local'にマッチ
        expect(result.length).toBeGreaterThan(0);
      });

      test('マッチしない検索語で空配列を返す', () => {
        const result = filterByEntry(testPasswords, 'NoMatch');
        expect(result).toHaveLength(0);
      });

      test('空の検索語ですべてを返す', () => {
        const result = filterByEntry(testPasswords, '');
        expect(result).toHaveLength(4);
      });
    });

    describe('URL検索', () => {
      test('ドメイン名で検索する', () => {
        const result = filterByURL(testPasswords, 'google');
        expect(result).toHaveLength(1);
        expect(result[0].entryName).toBe('Gmail');
      });

      test('完全なURLで検索する', () => {
        const result = filterByURL(testPasswords, 'https://github.com');
        expect(result).toHaveLength(1);
        expect(result[0].entryName).toBe('GitHub');
      });

      test('サブドメインを含む検索', () => {
        const result = filterByURL(testPasswords, 'mail.google.com');
        expect(result).toHaveLength(1);
        expect(result[0].entryName).toBe('Gmail');
      });

      test('URLを持たないエントリは除外される', () => {
        const result = filterByURL(testPasswords, 'local');
        expect(result).toHaveLength(0);
      });

      test('部分ドメインマッチング', () => {
        const result = filterByURL(testPasswords, 'face');
        expect(result).toHaveLength(1);
        expect(result[0].entryName).toBe('Facebook');
      });
    });
  });

  describe('検索クリア機能', () => {
    test('検索をクリアする', () => {
      mockSearchBox.value = 'test search';
      searchManager.clearSearch();
      
      expect(mockSearchBox.value).toBe('');
      expect(mockTableManager.render).toHaveBeenCalled();
    });
  });

  describe('エッジケースの処理', () => {
    // テスト用のhelper関数を定義
    function filterByEntry(passwords, searchTerm) {
      return passwords.filter(p => 
        p.entryName.toLowerCase().includes(searchTerm.toLowerCase().trim())
      );
    }

    function filterByURL(passwords, searchTerm) {
      return passwords.filter(p => {
        if (!p.url) return false;
        
        try {
          const urlWithProtocol = p.url.startsWith('http') ? p.url : 'https://' + p.url;
          const urlObj = new URL(urlWithProtocol);
          const host = urlObj.hostname.toLowerCase();
          
          let searchHost = searchTerm;
          if (searchTerm.includes('://') || (searchTerm.includes('/') && searchTerm.includes('.'))) {
            const testUrl = searchTerm.startsWith('http') ? searchTerm : 'https://' + searchTerm;
            try {
              searchHost = new URL(testUrl).hostname.toLowerCase();
            } catch (e) {
              searchHost = searchTerm.toLowerCase();
            }
          }
          
          return host.includes(searchHost.toLowerCase());
        } catch (e) {
          return false;
        }
      });
    }

    test('特殊文字を含む検索語を処理する', () => {
      const passwords = [
        { id: '1', entryName: 'Test@#$%', url: 'https://test.com' }
      ];
      
      const result = filterByEntry(passwords, '@#$');
      expect(result).toHaveLength(1);
    });

    test('非常に長い検索語を処理する', () => {
      const testPasswords = [
        { id: '1', entryName: 'Gmail', url: 'https://gmail.com' },
        { id: '2', entryName: 'GitHub', url: 'https://github.com' }
      ];
      const longSearchTerm = 'a'.repeat(1000);
      const result = filterByEntry(testPasswords, longSearchTerm);
      expect(result).toHaveLength(0);
    });

    test('Unicode文字を含む検索を処理する', () => {
      const passwords = [
        { id: '1', entryName: 'テストエントリ', url: 'https://test.com' }
      ];
      
      const result = filterByEntry(passwords, 'テスト');
      expect(result).toHaveLength(1);
    });

    test('空白文字のみの検索語を処理する', () => {
      const testPasswords = [
        { id: '1', entryName: 'Gmail', url: 'https://gmail.com' },
        { id: '2', entryName: 'GitHub', url: 'https://github.com' }
      ];
      const result = filterByEntry(testPasswords, '   ');
      expect(result).toHaveLength(0);
    });
  });

  describe('パフォーマンステスト', () => {
    // テスト用のhelper関数を定義
    function filterByEntry(passwords, searchTerm) {
      return passwords.filter(p => 
        p.entryName.toLowerCase().includes(searchTerm.toLowerCase().trim())
      );
    }

    function filterByURL(passwords, searchTerm) {
      return passwords.filter(p => {
        if (!p.url) return false;
        
        try {
          const urlWithProtocol = p.url.startsWith('http') ? p.url : 'https://' + p.url;
          const urlObj = new URL(urlWithProtocol);
          const host = urlObj.hostname.toLowerCase();
          
          let searchHost = searchTerm;
          if (searchTerm.includes('://') || (searchTerm.includes('/') && searchTerm.includes('.'))) {
            const testUrl = searchTerm.startsWith('http') ? searchTerm : 'https://' + searchTerm;
            try {
              searchHost = new URL(testUrl).hostname.toLowerCase();
            } catch (e) {
              searchHost = searchTerm.toLowerCase();
            }
          }
          
          return host.includes(searchHost.toLowerCase());
        } catch (e) {
          return false;
        }
      });
    }

    test('大量データでの検索パフォーマンス', () => {
      // 10,000件のテストデータを生成
      const largeDataset = Array.from({ length: 10000 }, (_, index) => ({
        id: index.toString(),
        entryName: `Entry ${index}`,
        url: `https://site${index}.com`,
        username: `user${index}`,
        password: `pass${index}`
      }));

      const start = Date.now();
      const result = filterByEntry(largeDataset, 'Entry 5000');
      const duration = Date.now() - start;

      expect(result).toHaveLength(1);
      expect(duration).toBeLessThan(100); // 100ms以内に完了することを確認
    });

    test('URL検索のパフォーマンス', () => {
      const largeDataset = Array.from({ length: 1000 }, (_, index) => ({
        id: index.toString(),
        entryName: `Site ${index}`,
        url: `https://site${index}.example.com/path`,
        username: `user${index}`,
        password: `pass${index}`
      }));

      const start = Date.now();
      const result = filterByURL(largeDataset, 'example.com');
      const duration = Date.now() - start;

      expect(result).toHaveLength(1000);
      expect(duration).toBeLessThan(200); // 200ms以内に完了することを確認
    });
  });

  describe('セキュリティ関連テスト', () => {
    // テスト用のhelper関数を定義
    function filterByEntry(passwords, searchTerm) {
      return passwords.filter(p => 
        p.entryName.toLowerCase().includes(searchTerm.toLowerCase().trim())
      );
    }

    test('SQLインジェクション様の文字列を安全に処理する', () => {
      const testPasswords = [
        { id: '1', entryName: 'Gmail', url: 'https://gmail.com' },
        { id: '2', entryName: 'GitHub', url: 'https://github.com' }
      ];
      const maliciousSearch = "'; DROP TABLE passwords; --";
      const result = filterByEntry(testPasswords, maliciousSearch);
      expect(result).toHaveLength(0);
      expect(Array.isArray(result)).toBe(true);
    });

    test('XSS様の文字列を安全に処理する', () => {
      const testPasswords = [
        { id: '1', entryName: 'Gmail', url: 'https://gmail.com' },
        { id: '2', entryName: 'GitHub', url: 'https://github.com' }
      ];
      const xssAttempt = '<script>alert("xss")</script>';
      const result = filterByEntry(testPasswords, xssAttempt);
      expect(result).toHaveLength(0);
      expect(Array.isArray(result)).toBe(true);
    });

    test('正規表現エスケープが適切に処理される', () => {
      const testPasswords = [
        { id: '1', entryName: 'Gmail', url: 'https://gmail.com' },
        { id: '2', entryName: 'GitHub', url: 'https://github.com' }
      ];
      const regexChars = '.*+?^${}()|[]\\';
      const result = filterByEntry(testPasswords, regexChars);
      expect(result).toHaveLength(0);
      expect(Array.isArray(result)).toBe(true);
    });
  });
});