# 実装ログ31: 検索バー右クリックペースト機能

## 実装日時
2025-06-26

## 実装した機能
検索バーにフォーカスがある状態で右クリックした際に、クリップボードに文字列がある場合「ペースト」選択肢を表示し、クリックでペースト機能を実装。

## 変更/作成したファイル

### 1. index.html (L193-198)
```html
<!-- 検索ボックス右クリックメニュー -->
<div id="searchBoxContextMenu" class="context-menu hidden">
    <div class="context-menu-item" id="pasteMenuItem">
        ペースト
    </div>
</div>
```

### 2. src/assets/css/components.css (L3-42)
コンテキストメニューのスタイルを追加：
```css
/* コンテキストメニュー */
.context-menu {
    position: fixed;
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    min-width: 120px;
}

.context-menu-item {
    padding: 8px 16px;
    cursor: pointer;
    font-size: 14px;
    color: #333;
    border-bottom: none;
}

.context-menu-item:hover {
    background-color: #f0f0f0;
}

.context-menu-item.disabled {
    color: #999;
    cursor: not-allowed;
    background-color: #f9f9f9;
}
```

### 3. src/assets/js/app.js
以下の変更を実装：

#### DOM要素の追加 (L28-30)
```javascript
// コンテキストメニュー要素
this.searchBoxContextMenu = document.getElementById('searchBoxContextMenu');
this.pasteMenuItem = document.getElementById('pasteMenuItem');
```

#### イベントリスナーの追加 (L96-108)
```javascript
// 検索ボックスの右クリックイベント
this.searchBox.addEventListener('contextmenu', (e) => this.handleSearchBoxContextMenu(e));

// コンテキストメニューのクリックイベント
this.pasteMenuItem.addEventListener('click', () => this.handlePasteToSearchBox());

// コンテキストメニューを隠すイベント
document.addEventListener('click', (e) => this.hideContextMenu(e));
document.addEventListener('contextmenu', (e) => {
    if (e.target !== this.searchBox) {
        this.hideContextMenu(e);
    }
});
```

#### メソッドの実装 (L303-356)
```javascript
async handleSearchBoxContextMenu(e) {
    e.preventDefault();
    
    // クリップボードの内容をチェック
    try {
        const clipboardText = await navigator.clipboard.readText();
        
        // クリップボードに文字列があるかチェック
        if (clipboardText && clipboardText.trim().length > 0) {
            this.pasteMenuItem.classList.remove('disabled');
        } else {
            this.pasteMenuItem.classList.add('disabled');
        }
    } catch (error) {
        // クリップボードアクセスに失敗した場合は無効にする
        this.pasteMenuItem.classList.add('disabled');
    }
    
    // コンテキストメニューを表示
    this.showContextMenu(e.clientX, e.clientY);
}

showContextMenu(x, y) {
    this.searchBoxContextMenu.style.left = `${x}px`;
    this.searchBoxContextMenu.style.top = `${y}px`;
    this.searchBoxContextMenu.classList.remove('hidden');
}

hideContextMenu(e) {
    if (!this.searchBoxContextMenu.contains(e.target)) {
        this.searchBoxContextMenu.classList.add('hidden');
    }
}

async handlePasteToSearchBox() {
    // 無効状態なら何もしない
    if (this.pasteMenuItem.classList.contains('disabled')) {
        return;
    }
    
    try {
        const clipboardText = await navigator.clipboard.readText();
        if (clipboardText && clipboardText.trim().length > 0) {
            this.searchBox.value = clipboardText.trim();
            this.searchManager.performSearch(clipboardText.trim());
            this.searchBox.focus();
        }
    } catch (error) {
        console.error('クリップボードからの貼り付けに失敗しました:', error);
    }
    
    // コンテキストメニューを隠す
    this.searchBoxContextMenu.classList.add('hidden');
}
```

## 主要な決定事項

### 1. クリップボードAPIの使用
- `navigator.clipboard.readText()`を使用してクリップボードの内容を取得
- セキュリティ上の理由でHTTPS環境でのみ動作

### 2. 動的な無効化機能
- 右クリック時にクリップボードの内容をチェック
- テキストが無い場合は「ペースト」オプションを無効化（グレーアウト）

### 3. 自動検索実行
- ペースト後に即座に検索を実行
- ユーザビリティの向上を図る

### 4. イベント管理
- クリック、右クリックイベントで適切にメニューを非表示
- 検索ボックス以外での右クリックではメニューを表示しない

## 実装上の工夫

### 1. エラーハンドリング
- クリップボードアクセス失敗時は「ペースト」を無効化
- 適切なフォールバック処理を実装

### 2. UI/UX配慮
- メニューの位置はマウスカーソルの位置に表示
- ホバー効果、無効状態のスタイリング

### 3. 既存機能との連携
- `SearchManager.performSearch()`を使用して既存の検索機能と連携
- ペースト後にフォーカスを検索ボックスに戻す

## 今後の拡張可能性
- 検索履歴の表示
- 複数のペーストオプション（クリア＆ペースト、追記ペーストなど）
- キーボードショートカット対応