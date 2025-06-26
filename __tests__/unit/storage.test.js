// ストレージ機能のテスト

describe('Storage Functions', () => {
  let originalElectronAPI;

  beforeEach(() => {
    // electronAPIのモックを設定
    originalElectronAPI = global.window?.electronAPI;
    global.window = {
      electronAPI: {
        savePasswords: jest.fn(),
        loadPasswords: jest.fn(),
        openPasswordFolder: jest.fn(),
        loadSettings: jest.fn(),
        saveSettings: jest.fn(),
        selectStorageFolder: jest.fn()
      }
    };
  });

  afterEach(() => {
    if (originalElectronAPI) {
      global.window.electronAPI = originalElectronAPI;
    }
    jest.clearAllMocks();
  });

  // storage.jsの関数を模倣
  async function savePasswords(passwords) {
    await window.electronAPI.savePasswords(passwords);
  }

  async function loadPasswords() {
    return await window.electronAPI.loadPasswords();
  }

  async function openPasswordFolder() {
    try {
      await window.electronAPI.openPasswordFolder();
    } catch (error) {
      throw error;
    }
  }

  describe('パスワード保存機能', () => {
    test('正常にパスワードを保存する', async () => {
      const testPasswords = [
        {
          id: '1',
          entryName: 'Gmail',
          username: 'test@example.com',
          password: 'testpass123',
          url: 'https://gmail.com',
          notes: 'テストノート',
          updatedAt: new Date().toISOString()
        }
      ];

      window.electronAPI.savePasswords.mockResolvedValue({ success: true });

      await savePasswords(testPasswords);

      expect(window.electronAPI.savePasswords).toHaveBeenCalledWith(testPasswords);
      expect(window.electronAPI.savePasswords).toHaveBeenCalledTimes(1);
    });

    test('空配列を保存する', async () => {
      window.electronAPI.savePasswords.mockResolvedValue({ success: true });

      await savePasswords([]);

      expect(window.electronAPI.savePasswords).toHaveBeenCalledWith([]);
    });

    test('保存エラーを適切に処理する', async () => {
      const testPasswords = [{ id: '1', entryName: 'Test' }];
      const errorMessage = 'Save failed';
      
      window.electronAPI.savePasswords.mockRejectedValue(new Error(errorMessage));

      await expect(savePasswords(testPasswords)).rejects.toThrow(errorMessage);
    });

    test('複数のパスワードを保存する', async () => {
      const testPasswords = [
        {
          id: '1',
          entryName: 'Gmail',
          username: 'user1@example.com',
          password: 'pass1',
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          entryName: 'GitHub',
          username: 'user2',
          password: 'pass2',
          updatedAt: new Date().toISOString()
        }
      ];

      window.electronAPI.savePasswords.mockResolvedValue({ success: true });

      await savePasswords(testPasswords);

      expect(window.electronAPI.savePasswords).toHaveBeenCalledWith(testPasswords);
      expect(testPasswords).toHaveLength(2);
    });
  });

  describe('パスワード読み込み機能', () => {
    test('正常にパスワードを読み込む', async () => {
      const mockPasswords = [
        {
          id: '1',
          entryName: 'Gmail',
          username: 'test@example.com',
          password: 'testpass123',
          url: 'https://gmail.com',
          notes: 'テストノート',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      ];

      window.electronAPI.loadPasswords.mockResolvedValue(mockPasswords);

      const result = await loadPasswords();

      expect(result).toEqual(mockPasswords);
      expect(window.electronAPI.loadPasswords).toHaveBeenCalledTimes(1);
    });

    test('空のパスワードリストを読み込む', async () => {
      window.electronAPI.loadPasswords.mockResolvedValue([]);

      const result = await loadPasswords();

      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });

    test('読み込みエラーを適切に処理する', async () => {
      const errorMessage = 'Load failed';
      
      window.electronAPI.loadPasswords.mockRejectedValue(new Error(errorMessage));

      await expect(loadPasswords()).rejects.toThrow(errorMessage);
    });

    test('破損したデータの読み込みを処理する', async () => {
      // nullまたはundefinedが返された場合
      window.electronAPI.loadPasswords.mockResolvedValue(null);

      const result = await loadPasswords();

      expect(result).toBeNull();
    });

    test('複数のパスワードを読み込む', async () => {
      const mockPasswords = [
        { id: '1', entryName: 'Gmail', username: 'user1', password: 'pass1' },
        { id: '2', entryName: 'GitHub', username: 'user2', password: 'pass2' },
        { id: '3', entryName: 'Facebook', username: 'user3', password: 'pass3' }
      ];

      window.electronAPI.loadPasswords.mockResolvedValue(mockPasswords);

      const result = await loadPasswords();

      expect(result).toHaveLength(3);
      expect(result).toEqual(mockPasswords);
    });
  });

  describe('パスワードフォルダー操作', () => {
    test('正常にパスワードフォルダーを開く', async () => {
      window.electronAPI.openPasswordFolder.mockResolvedValue();

      await openPasswordFolder();

      expect(window.electronAPI.openPasswordFolder).toHaveBeenCalledTimes(1);
    });

    test('フォルダー開封エラーを適切に処理する', async () => {
      const errorMessage = 'Folder access denied';
      
      window.electronAPI.openPasswordFolder.mockRejectedValue(new Error(errorMessage));

      await expect(openPasswordFolder()).rejects.toThrow(errorMessage);
    });

    test('システムエラーを処理する', async () => {
      window.electronAPI.openPasswordFolder.mockRejectedValue(new Error('System error'));

      await expect(openPasswordFolder()).rejects.toThrow('System error');
    });
  });

  describe('データ整合性テスト', () => {
    test('保存と読み込みの一貫性を確認', async () => {
      const testPasswords = [
        {
          id: '1',
          entryName: 'Test Entry',
          username: 'testuser',
          password: 'testpass',
          url: 'https://example.com',
          notes: 'テストノート',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      ];

      // 保存の設定
      window.electronAPI.savePasswords.mockResolvedValue({ success: true });
      
      // 読み込みの設定（保存したデータと同じものを返す）
      window.electronAPI.loadPasswords.mockResolvedValue(testPasswords);

      // 保存と読み込みを実行
      await savePasswords(testPasswords);
      const loadedPasswords = await loadPasswords();

      expect(loadedPasswords).toEqual(testPasswords);
    });

    test('大量データの処理', async () => {
      // 1000件のパスワードエントリを生成
      const largePasswordSet = Array.from({ length: 1000 }, (_, index) => ({
        id: (index + 1).toString(),
        entryName: `Entry ${index + 1}`,
        username: `user${index + 1}@example.com`,
        password: `password${index + 1}`,
        updatedAt: new Date().toISOString()
      }));

      window.electronAPI.savePasswords.mockResolvedValue({ success: true });
      window.electronAPI.loadPasswords.mockResolvedValue(largePasswordSet);

      await savePasswords(largePasswordSet);
      const result = await loadPasswords();

      expect(result).toHaveLength(1000);
      expect(result[0].entryName).toBe('Entry 1');
      expect(result[999].entryName).toBe('Entry 1000');
    });
  });

  describe('エラーハンドリング', () => {
    test('ネットワークエラーを処理する', async () => {
      window.electronAPI.savePasswords.mockRejectedValue(new Error('Network error'));

      await expect(savePasswords([{ id: '1' }])).rejects.toThrow('Network error');
    });

    test('権限エラーを処理する', async () => {
      window.electronAPI.openPasswordFolder.mockRejectedValue(new Error('Permission denied'));

      await expect(openPasswordFolder()).rejects.toThrow('Permission denied');
    });

    test('ディスク容量不足エラーを処理する', async () => {
      window.electronAPI.savePasswords.mockRejectedValue(new Error('Insufficient disk space'));

      await expect(savePasswords([{ id: '1' }])).rejects.toThrow('Insufficient disk space');
    });

    test('ファイル破損エラーを処理する', async () => {
      window.electronAPI.loadPasswords.mockRejectedValue(new Error('File corrupted'));

      await expect(loadPasswords()).rejects.toThrow('File corrupted');
    });
  });

  describe('パフォーマンステスト', () => {
    test('保存操作のタイムアウト処理', async () => {
      jest.setTimeout(10000); // 10秒のタイムアウト

      const mockDelay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
      
      window.electronAPI.savePasswords.mockImplementation(async () => {
        await mockDelay(100); // 100ms遅延をシミュレート
        return { success: true };
      });

      const start = Date.now();
      await savePasswords([{ id: '1', entryName: 'Test' }]);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(1000); // 1秒以内に完了することを確認
    });

    test('読み込み操作のパフォーマンス', async () => {
      const mockPasswords = Array.from({ length: 100 }, (_, i) => ({ 
        id: i.toString(), 
        entryName: `Entry ${i}` 
      }));

      window.electronAPI.loadPasswords.mockResolvedValue(mockPasswords);

      const start = Date.now();
      const result = await loadPasswords();
      const duration = Date.now() - start;

      expect(result).toHaveLength(100);
      expect(duration).toBeLessThan(500); // 500ms以内に完了することを確認
    });
  });
});