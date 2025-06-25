// 検索機能

class SearchManager {
    constructor(searchBox, tableManager) {
        this.searchBox = searchBox;
        this.tableManager = tableManager;
        
        this.initEventListeners();
    }
    
    initEventListeners() {
        this.searchBox.addEventListener('input', () => this.handleSearch());
    }
    
    handleSearch() {
        // TableManagerがレンダリングを処理
        this.tableManager.render();
    }
    
    clearSearch() {
        this.searchBox.value = '';
        this.tableManager.render();
    }
}

export { SearchManager };