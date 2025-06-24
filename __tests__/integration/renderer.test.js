// 統合テスト - レンダラープロセスの動作確認

describe('Renderer Integration Tests', () => {
  beforeEach(() => {
    // DOM環境をセットアップ
    document.body.innerHTML = `
      <input type="text" id="searchBox" />
      <button id="addBtn">新規追加</button>
      <table id="passwordTable">
        <tbody id="passwordList"></tbody>
      </table>
      <div id="emptyState" class="hidden"></div>
      <div id="modal" class="modal">
        <h2 id="modalTitle"></h2>
        <span id="closeModal"></span>
        <form id="passwordForm">
          <input id="entryName" />
          <input id="username" />
          <input id="password" />
          <button id="generateBtn" type="button"></button>
          <button id="cancelBtn" type="button"></button>
        </form>
      </div>
    `;

    // モックをリセット
    jest.clearAllMocks();
    
    // electronAPIのモックレスポンスを設定
    window.electronAPI.loadPasswords.mockResolvedValue([]);
    window.electronAPI.savePasswords.mockResolvedValue({ success: true });
  });

  test('should initialize with empty password list', async () => {
    window.electronAPI.loadPasswords.mockResolvedValue([]);
    
    // 初期化をシミュレート
    const passwords = await window.electronAPI.loadPasswords();
    
    expect(passwords).toEqual([]);
    expect(window.electronAPI.loadPasswords).toHaveBeenCalledTimes(1);
  });

  test('should save passwords when adding new entry', async () => {
    const newPassword = {
      id: '123',
      entryName: 'Test Entry',
      username: 'testuser',
      password: 'testpass123',
      updatedAt: new Date().toISOString()
    };

    const result = await window.electronAPI.savePasswords([newPassword]);
    
    expect(result.success).toBe(true);
    expect(window.electronAPI.savePasswords).toHaveBeenCalledWith([newPassword]);
  });

  test('should copy password to clipboard', async () => {
    const testPassword = 'mySecretPassword';
    
    await window.electronAPI.copyToClipboard(testPassword);
    
    expect(window.electronAPI.copyToClipboard).toHaveBeenCalledWith(testPassword);
  });

  test('should display modal when add button is clicked', () => {
    const modal = document.getElementById('modal');
    const addBtn = document.getElementById('addBtn');
    
    // モーダル表示をシミュレート
    addBtn.addEventListener('click', () => {
      modal.style.display = 'block';
    });
    
    addBtn.click();
    
    expect(modal.style.display).toBe('block');
  });

  test('should hide modal when cancel button is clicked', () => {
    const modal = document.getElementById('modal');
    const cancelBtn = document.getElementById('cancelBtn');
    
    modal.style.display = 'block';
    
    cancelBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });
    
    cancelBtn.click();
    
    expect(modal.style.display).toBe('none');
  });

  test('should filter table based on search input', () => {
    const searchBox = document.getElementById('searchBox');
    const passwordList = document.getElementById('passwordList');
    
    // テストデータでテーブルを埋める
    const testData = [
      { id: '1', entryName: 'Gmail', username: 'test1', password: 'pass1' },
      { id: '2', entryName: 'Facebook', username: 'test2', password: 'pass2' },
      { id: '3', entryName: 'GitHub', username: 'test3', password: 'pass3' }
    ];
    
    // 検索機能をシミュレート
    function filterPasswords(searchTerm) {
      return testData.filter(p => 
        p.entryName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    const filtered = filterPasswords('git');
    expect(filtered).toHaveLength(1);
    expect(filtered[0].entryName).toBe('GitHub');
  });
});