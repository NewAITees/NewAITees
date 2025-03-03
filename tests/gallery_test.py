import http.server
import socketserver
import webbrowser
import os
import time
import logging

# ロギング設定
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s',
    filename='gallery_test.log',
    filemode='w'
)

PORT = 8000

# カスタムハンドラーでリクエストをログに記録
class LoggingHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        logging.info("%s - %s" % (self.address_string(), format % args))
    
    def end_headers(self):
        # JavaScriptコンソールログをキャプチャするための追加ヘッダー
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

# カスタムJavaScriptをギャラリーページに挿入して問題を診断
def inject_debug_script():
    if os.path.exists('gallery.html'):
        with open('gallery.html', 'r', encoding='utf-8') as f:
            content = f.read()
        
        debug_script = """
        <script>
        // ギャラリー機能のデバッグ用スクリプト
        console.log('ギャラリーデバッグスクリプトを読み込みました');
        
        // DOMの読み込み完了時にテスト実行
        document.addEventListener('DOMContentLoaded', function() {
            console.log('DOM読み込み完了、テスト開始');
            
            // 「すべて表示」ボタンの検出
            const allButton = document.querySelector('.filter-btn[data-filter="all"]');
            console.log('「すべて表示」ボタン:', allButton);
            
            if (allButton) {
                // ボタンのプロパティを確認
                console.log('ボタン属性:', {
                    className: allButton.className,
                    dataFilter: allButton.dataset.filter,
                    hasClickListener: allButton.onclick !== null || allButton._events
                });
                
                // イベントリスナーのテスト
                console.log('クリックイベントをシミュレート');
                setTimeout(() => {
                    allButton.click();
                    console.log('クリック後のギャラリーアイテム数:', 
                        document.querySelectorAll('.gallery-item').length);
                }, 1000);
            }
            
            // ギャラリーデータの読み込み状況確認
            console.log('window.galleryImages:', window.galleryImages ? 
                `${window.galleryImages.length}件読み込み済み` : '未定義');
            
            // フィルターボタン全体の状態確認
            const allFilterButtons = document.querySelectorAll('.filter-btn');
            console.log(`フィルターボタン数: ${allFilterButtons.length}個`);
            allFilterButtons.forEach((btn, i) => {
                console.log(`ボタン${i}: ${btn.textContent} - フィルター: ${btn.dataset.filter}`);
            });
        });
        
        // グローバル関数のモニタリング
        const originalRenderGallery = window.renderGallery;
        window.renderGallery = function(...args) {
            console.log('renderGallery関数が呼び出されました', args);
            return originalRenderGallery.apply(this, args);
        };
        
        const originalInitGallery = window.initGallery;
        window.initGallery = async function(...args) {
            console.log('initGallery関数が呼び出されました', args);
            try {
                const result = await originalInitGallery.apply(this, args);
                console.log('initGallery完了:', result);
                return result;
            } catch (error) {
                console.error('initGallery実行エラー:', error);
                throw error;
            }
        };
        </script>
        """
        
        # </body>タグの前にデバッグスクリプトを挿入
        if '</body>' in content:
            modified_content = content.replace('</body>', debug_script + '</body>')
            
            # 一時的な変更としてギャラリーページを保存
            with open('gallery_debug.html', 'w', encoding='utf-8') as f:
                f.write(modified_content)
                
            logging.info('デバッグスクリプトを挿入したギャラリーページを作成しました')
            return 'gallery_debug.html'
    
    logging.error('gallery.htmlが見つかりません')
    return None

# テスト実行
def run_test():
    logging.info('ギャラリーテスト開始')
    
    # デバッグスクリプト挿入
    debug_file = inject_debug_script()
    
    if not debug_file:
        logging.error('テスト用ファイルの作成に失敗しました')
        return
    
    # 簡易ウェブサーバー起動
    handler = LoggingHTTPRequestHandler
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        logging.info(f"サーバーをポート {PORT} で起動しました")
        
        # ブラウザでテストページを開く
        test_url = f"http://localhost:{PORT}/{debug_file}"
        webbrowser.open(test_url)
        
        # サーバーを20秒間実行して結果を取得
        logging.info("テスト実行中...")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass
        finally:
            httpd.server_close()
            logging.info("テスト完了、サーバー停止")

if __name__ == "__main__":
    run_test() 