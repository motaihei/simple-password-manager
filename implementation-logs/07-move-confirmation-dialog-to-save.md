# 更新・編集の確認ダイアログを保存ボタン押下時に移動

## 実装日時
2025-06-25

## 実装した機能
詳細モーダルの更新・編集ボタンをクリックしてから、実際にフォームの「保存」ボタンを押下するタイミングで確認ダイアログを表示するように変更しました。

## 変更/作成したファイル
- `/src/assets/js/app.js` - フォーム送信ハンドラーに確認ダイアログを移動、更新・編集ボタンハンドラーから確認ダイアログを削除

## 主要な決定事項
1. **確認タイミングの変更**：
   - 更新・編集ボタンクリック時ではなく、実際に保存操作を実行する際に確認
   - ユーザーが編集内容を確認してから最終的な確認を行える

2. **メッセージ内容**：
   - 更新時と編集時で異なるメッセージを維持
   - 操作の影響を明確に説明

3. **実装方法**：
   - `handleFormSubmit`メソッド内でeditingIdの種類に応じて適切な確認ダイアログを表示
   - キャンセル時は処理を中止し、フォームは開いたまま

## コード例

### フォーム送信時の確認ダイアログ
```javascript
async handleFormSubmit(e) {
    e.preventDefault();
    
    const data = {
        entryName: this.modalManager.entryNameInput.value,
        username: this.modalManager.usernameInput.value,
        url: this.modalManager.urlInput.value || null,
        password: this.modalManager.passwordInput.value,
        updatedAt: new Date().toISOString()
    };
    
    if (this.modalManager.editingId && this.modalManager.editingId.startsWith('update-')) {
        // 更新の場合の確認ダイアログ
        const confirmed = confirm(
            `エントリ「${data.entryName}」のパスワードを更新しますか？\n\n` +
            `この操作により、新しいパスワードで別のエントリが作成されます。\n` +
            `既存のエントリは履歴として残ります。`
        );
        
        if (!confirmed) {
            return;
        }
        
        // 更新の場合は新しいエントリとして追加
        data.id = Date.now().toString();
        this.passwords.push(data);
    } else if (this.modalManager.editingId) {
        // 編集の場合の確認ダイアログ
        const confirmed = confirm(
            `エントリ「${data.entryName}」を編集しますか？\n\n` +
            `この操作により、既存のエントリ情報が上書きされます。\n` +
            `編集前の情報は失われます。`
        );
        
        if (!confirmed) {
            return;
        }
        
        // 編集の場合は既存のエントリを更新
        const index = this.passwords.findIndex(p => p.id === this.modalManager.editingId);
        this.passwords[index] = { ...this.passwords[index], ...data };
    } else {
        // 新規の場合の処理（既存のまま）
    }
}
```

## 遭遇した問題と解決策
特に問題は発生しませんでした。確認ダイアログの表示タイミングを適切に変更することで、ユーザーがより自然なフローで操作できるようになりました。

## 今後の改善案
- 確認ダイアログをスキップする設定オプションの追加
- 変更内容の差分表示機能
- 編集前のデータを一時的に保存し、キャンセル時に復元する機能