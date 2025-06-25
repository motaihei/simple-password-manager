// テーマ切り替え機能

class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('themeToggle');
        this.themeIcon = document.querySelector('.theme-icon');
        
        this.initEventListeners();
        this.loadTheme();
    }
    
    initEventListeners() {
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
    }
    
    toggleTheme() {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        
        // アイコンの更新
        this.themeIcon.textContent = isDarkMode ? '☀️' : '🌙';
        
        // 設定の保存
        localStorage.setItem('darkMode', isDarkMode);
    }
    
    loadTheme() {
        // ダークモード設定の復元
        const darkMode = localStorage.getItem('darkMode') === 'true';
        if (darkMode) {
            document.body.classList.add('dark-mode');
            this.themeIcon.textContent = '☀️';
        }
    }
}

export { ThemeManager };