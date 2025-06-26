// テーブル列幅調整機能
class TableResizer {
    constructor(table) {
        this.table = table;
        this.resizableColumns = [0, 1, 4]; // エントリ、ユーザー名、更新日のインデックス
        this.isResizing = false;
        this.currentColumn = null;
        this.startX = 0;
        this.startWidth = 0;
        this.minWidth = 50; // 最小列幅
        
        // 保存された列幅を読み込み
        this.savedWidths = this.loadColumnWidths();
        
        this.init();
    }
    
    init() {
        this.createResizeHandles();
        this.applyStoredWidths();
        this.setupEventListeners();
    }
    
    // リサイズハンドルを作成
    createResizeHandles() {
        const thead = this.table.querySelector('thead');
        const headerRow = thead.querySelector('tr');
        const headers = headerRow.querySelectorAll('th');
        
        this.resizableColumns.forEach(index => {
            const header = headers[index];
            if (!header) return;
            
            // リサイズハンドルを作成
            const resizeHandle = document.createElement('div');
            resizeHandle.className = 'column-resize-handle';
            resizeHandle.dataset.columnIndex = index;
            
            // ヘッダーに相対位置を設定
            header.style.position = 'relative';
            header.appendChild(resizeHandle);
        });
    }
    
    // イベントリスナーを設定
    setupEventListeners() {
        // リサイズハンドルのイベント
        this.table.addEventListener('mousedown', this.handleMouseDown.bind(this));
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
        
        // ウィンドウリサイズ時の処理
        window.addEventListener('resize', () => {
            this.updateTableLayout();
        });
    }
    
    handleMouseDown(e) {
        if (!e.target.classList.contains('column-resize-handle')) return;
        
        e.preventDefault();
        this.isResizing = true;
        this.currentColumn = parseInt(e.target.dataset.columnIndex);
        this.startX = e.pageX;
        
        const th = this.table.querySelector(`thead th:nth-child(${this.currentColumn + 1})`);
        this.startWidth = th.offsetWidth;
        
        // リサイズ中のスタイル
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        
        // リサイズ中を示すクラスを追加
        this.table.classList.add('table-resizing');
    }
    
    handleMouseMove(e) {
        if (!this.isResizing) return;
        
        const diff = e.pageX - this.startX;
        const newWidth = Math.max(this.minWidth, this.startWidth + diff);
        
        // ヘッダーとすべての行の該当列の幅を更新
        this.updateColumnWidth(this.currentColumn, newWidth);
    }
    
    handleMouseUp(e) {
        if (!this.isResizing) return;
        
        this.isResizing = false;
        this.currentColumn = null;
        
        // スタイルをリセット
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        this.table.classList.remove('table-resizing');
        
        // 列幅を保存
        this.saveColumnWidths();
    }
    
    // 列幅を更新
    updateColumnWidth(columnIndex, width) {
        const headers = this.table.querySelectorAll('thead th');
        const cells = this.table.querySelectorAll(`tbody td:nth-child(${columnIndex + 1})`);
        
        // ヘッダーの幅を設定
        if (headers[columnIndex]) {
            headers[columnIndex].style.width = `${width}px`;
            headers[columnIndex].style.minWidth = `${width}px`;
            headers[columnIndex].style.maxWidth = `${width}px`;
        }
        
        // セルの幅を設定
        cells.forEach(cell => {
            cell.style.width = `${width}px`;
            cell.style.minWidth = `${width}px`;
            cell.style.maxWidth = `${width}px`;
        });
    }
    
    // 列幅をローカルストレージに保存
    saveColumnWidths() {
        const widths = {};
        const headers = this.table.querySelectorAll('thead th');
        
        this.resizableColumns.forEach(index => {
            if (headers[index]) {
                widths[index] = headers[index].offsetWidth;
            }
        });
        
        try {
            localStorage.setItem('tableColumnWidths', JSON.stringify(widths));
        } catch (e) {
            console.error('列幅の保存に失敗しました:', e);
        }
    }
    
    // 保存された列幅を読み込み
    loadColumnWidths() {
        try {
            const saved = localStorage.getItem('tableColumnWidths');
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            console.error('列幅の読み込みに失敗しました:', e);
            return {};
        }
    }
    
    // 保存された幅を適用
    applyStoredWidths() {
        Object.entries(this.savedWidths).forEach(([index, width]) => {
            const columnIndex = parseInt(index);
            if (this.resizableColumns.includes(columnIndex) && width) {
                this.updateColumnWidth(columnIndex, width);
            }
        });
    }
    
    // テーブルレイアウトを更新（必要に応じて）
    updateTableLayout() {
        // テーブルの固定レイアウトを一時的に解除して再計算
        this.table.style.tableLayout = 'auto';
        setTimeout(() => {
            this.table.style.tableLayout = 'fixed';
        }, 0);
    }
    
    // リサイズ機能を破棄
    destroy() {
        // リサイズハンドルを削除
        const handles = this.table.querySelectorAll('.column-resize-handle');
        handles.forEach(handle => handle.remove());
        
        // イベントリスナーを削除
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseup', this.handleMouseUp);
    }
}

export { TableResizer };