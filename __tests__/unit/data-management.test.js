// データ管理機能のテスト

describe('Data Management', () => {
  let passwords;

  beforeEach(() => {
    passwords = [];
  });

  describe('Password CRUD Operations', () => {
    test('should add a new password entry', () => {
      const newEntry = {
        id: Date.now().toString(),
        entryName: 'Gmail',
        username: 'test@example.com',
        password: 'testPassword123',
        updatedAt: new Date().toISOString()
      };

      passwords.push(newEntry);
      
      expect(passwords).toHaveLength(1);
      expect(passwords[0]).toEqual(newEntry);
    });

    test('should update an existing password entry', () => {
      const entry = {
        id: '123',
        entryName: 'Gmail',
        username: 'test@example.com',
        password: 'oldPassword',
        updatedAt: new Date().toISOString()
      };
      passwords.push(entry);

      const updatedData = {
        entryName: 'Gmail Work',
        username: 'work@example.com',
        password: 'newPassword',
        updatedAt: new Date().toISOString()
      };

      const index = passwords.findIndex(p => p.id === '123');
      passwords[index] = { ...passwords[index], ...updatedData };

      expect(passwords[0].entryName).toBe('Gmail Work');
      expect(passwords[0].username).toBe('work@example.com');
      expect(passwords[0].password).toBe('newPassword');
      expect(passwords[0].id).toBe('123'); // IDは変更されない
    });

    test('should delete a password entry', () => {
      passwords = [
        { id: '1', entryName: 'Gmail', username: 'test1@example.com', password: 'pass1' },
        { id: '2', entryName: 'Facebook', username: 'test2@example.com', password: 'pass2' },
        { id: '3', entryName: 'Twitter', username: 'test3@example.com', password: 'pass3' }
      ];

      passwords = passwords.filter(p => p.id !== '2');

      expect(passwords).toHaveLength(2);
      expect(passwords.find(p => p.id === '2')).toBeUndefined();
      expect(passwords.find(p => p.id === '1')).toBeDefined();
      expect(passwords.find(p => p.id === '3')).toBeDefined();
    });
  });

  describe('Search Functionality', () => {
    beforeEach(() => {
      passwords = [
        { id: '1', entryName: 'Gmail', username: 'test1@example.com', password: 'pass1' },
        { id: '2', entryName: 'Facebook', username: 'test2@example.com', password: 'pass2' },
        { id: '3', entryName: 'Twitter', username: 'test3@example.com', password: 'pass3' },
        { id: '4', entryName: 'GitHub', username: 'test4@example.com', password: 'pass4' }
      ];
    });

    test('should filter passwords by search term', () => {
      const searchTerm = 'git';
      const filtered = passwords.filter(p => 
        p.entryName.toLowerCase().includes(searchTerm.toLowerCase())
      );

      expect(filtered).toHaveLength(1);
      expect(filtered[0].entryName).toBe('GitHub');
    });

    test('should return all passwords when search term is empty', () => {
      const searchTerm = '';
      const filtered = passwords.filter(p => 
        p.entryName.toLowerCase().includes(searchTerm.toLowerCase())
      );

      expect(filtered).toHaveLength(4);
    });

    test('should be case insensitive', () => {
      const searchTerm = 'GMAIL';
      const filtered = passwords.filter(p => 
        p.entryName.toLowerCase().includes(searchTerm.toLowerCase())
      );

      expect(filtered).toHaveLength(1);
      expect(filtered[0].entryName).toBe('Gmail');
    });

    test('should return empty array when no matches found', () => {
      const searchTerm = 'LinkedIn';
      const filtered = passwords.filter(p => 
        p.entryName.toLowerCase().includes(searchTerm.toLowerCase())
      );

      expect(filtered).toHaveLength(0);
    });
  });
});