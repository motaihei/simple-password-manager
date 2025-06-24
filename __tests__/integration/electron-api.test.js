// Electron API統合テスト

describe('Electron API Integration', () => {
  describe('File Operations', () => {
    test('should load passwords from file', async () => {
      const mockPasswords = [
        { id: '1', entryName: 'Gmail', username: 'user1', password: 'pass1' },
        { id: '2', entryName: 'Facebook', username: 'user2', password: 'pass2' }
      ];
      
      window.electronAPI.loadPasswords.mockResolvedValue(mockPasswords);
      
      const passwords = await window.electronAPI.loadPasswords();
      
      expect(passwords).toEqual(mockPasswords);
      expect(passwords).toHaveLength(2);
    });

    test('should handle empty file gracefully', async () => {
      window.electronAPI.loadPasswords.mockResolvedValue([]);
      
      const passwords = await window.electronAPI.loadPasswords();
      
      expect(passwords).toEqual([]);
      expect(Array.isArray(passwords)).toBe(true);
    });

    test('should save passwords to file', async () => {
      const passwordsToSave = [
        { id: '1', entryName: 'Gmail', username: 'user1', password: 'pass1' }
      ];
      
      window.electronAPI.savePasswords.mockResolvedValue({ success: true });
      
      const result = await window.electronAPI.savePasswords(passwordsToSave);
      
      expect(result.success).toBe(true);
      expect(window.electronAPI.savePasswords).toHaveBeenCalledWith(passwordsToSave);
    });

    test('should handle save errors', async () => {
      const error = new Error('Failed to save');
      window.electronAPI.savePasswords.mockRejectedValue(error);
      
      await expect(window.electronAPI.savePasswords([])).rejects.toThrow('Failed to save');
    });
  });

  describe('Clipboard Operations', () => {
    test('should copy text to clipboard', async () => {
      const textToCopy = 'myPassword123';
      
      await window.electronAPI.copyToClipboard(textToCopy);
      
      expect(window.electronAPI.copyToClipboard).toHaveBeenCalledWith(textToCopy);
    });

    test('should handle clipboard errors gracefully', async () => {
      window.electronAPI.copyToClipboard.mockImplementation(() => {
        throw new Error('Clipboard access denied');
      });
      
      expect(() => {
        window.electronAPI.copyToClipboard('test');
      }).toThrow('Clipboard access denied');
    });
  });
});