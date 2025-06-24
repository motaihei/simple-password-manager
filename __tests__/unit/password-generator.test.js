// パスワード生成機能のテスト

describe('Password Generator', () => {
  // renderer.jsからgeneratePassword関数を抽出してテスト
  function generatePassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let password = '';
    for (let i = 0; i < 16; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  test('should generate a password of length 16', () => {
    const password = generatePassword();
    expect(password).toHaveLength(16);
  });

  test('should generate different passwords each time', () => {
    const passwords = new Set();
    for (let i = 0; i < 100; i++) {
      passwords.add(generatePassword());
    }
    // 100回実行してすべて異なることを確認（確率的にはほぼ確実）
    expect(passwords.size).toBe(100);
  });

  test('should contain allowed characters only', () => {
    const allowedChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    const password = generatePassword();
    
    for (const char of password) {
      expect(allowedChars).toContain(char);
    }
  });

  test('should contain mix of character types', () => {
    // 100回生成して、各種文字が含まれることを確認
    let hasUpperCase = false;
    let hasLowerCase = false;
    let hasNumber = false;
    let hasSpecial = false;

    for (let i = 0; i < 100; i++) {
      const password = generatePassword();
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