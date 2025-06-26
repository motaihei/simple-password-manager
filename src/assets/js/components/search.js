// 検索機能

class SearchManager {
    constructor(searchBox, tableManager) {
        this.searchBox = searchBox;
        this.tableManager = tableManager;
        this.searchModeSelect = document.getElementById('searchMode');
        
        this.initEventListeners();
        this.updatePlaceholder();
    }
    
    initEventListeners() {
        this.searchBox.addEventListener('input', () => this.handleSearch());
        this.searchModeSelect.addEventListener('change', () => this.handleModeChange());
    }
    
    handleSearch() {
        // TableManagerがレンダリングを処理
        this.tableManager.render();
    }
    
    handleModeChange() {
        this.updatePlaceholder();
        this.tableManager.render();
    }
    
    updatePlaceholder() {
        const mode = this.searchModeSelect.value;
        if (mode === 'url') {
            this.searchBox.placeholder = 'URLまたはホストで検索...（例: google.com, https://example.com/path）';
        } else {
            this.searchBox.placeholder = 'エントリで検索...';
        }
    }
    
    getCurrentMode() {
        return this.searchModeSelect.value;
    }
    
    // URLからホスト部分を抽出
    extractHost(url) {
        if (!url) return '';
        
        try {
            // プロトコルがない場合は追加
            const urlWithProtocol = url.startsWith('http') ? url : 'https://' + url;
            const urlObj = new URL(urlWithProtocol);
            return urlObj.hostname.toLowerCase();
        } catch (e) {
            // URLの解析に失敗した場合は元の文字列をそのまま返す
            return url.toLowerCase();
        }
    }
    
    clearSearch() {
        this.searchBox.value = '';
        this.tableManager.render();
    }
}

export { SearchManager };