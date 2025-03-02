/**
 * home-gallery.js
 * トップページ用のギャラリープレビュー表示機能
 * ギャラリーから5枚の画像をランダムに選んで表示します
 */

document.addEventListener('DOMContentLoaded', function() {
    initHomeGallery();
});

/**
 * トップページのギャラリープレビューを初期化する
 */
function initHomeGallery() {
    const homeGallery = document.getElementById('home-gallery');
    if (!homeGallery) return;
    
    // 静的に参照されるフォールバック画像のパス
    const FALLBACK_IMAGE_PATH = './assets/images/placeholder.png';
    
    // ロード中表示
    homeGallery.innerHTML = '<p>ギャラリーデータを読み込み中...</p>';

    // JSONファイルからデータを読み込む
    fetch('./assets/js/gallery-data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('JSONファイルが見つかりません');
            }
            return response.json();
        })
        .then(data => {
            console.log('JSONからギャラリーデータを読み込みました', data.length + '件');
            
            // 画像パスを標準化
            const processedData = data.filter(item => item && item.src).map(item => {
                // 画像パスを常に ./assets/ 形式に統一
                let src = item.src;
                
                // 重複パス修正 (assets/assets/ → assets/)
                if (src.includes('assets/assets/')) {
                    src = src.replace('assets/assets/', 'assets/');
                }
                
                // 先頭の./ がない場合は追加
                if (!src.startsWith('./') && !src.startsWith('/')) {
                    if (src.startsWith('assets/')) {
                        src = './' + src;
                    } else {
                        src = './assets/images/' + src;
                    }
                }
                
                // 既に絶対パスの場合はそのまま
                if (src.startsWith('/')) {
                    src = '.' + src;
                }
                
                // 更新されたオブジェクトを返す
                return {
                    ...item,
                    src: src,
                    alt: item.alt || 'Gallery Image'
                };
            });
            
            // 有効なデータがあるか確認
            if (processedData.length === 0) {
                throw new Error('表示可能な画像データがありません');
            }
            
            displayRandomImages(processedData);
        })
        .catch(error => {
            console.warn('JSONからの読み込みに失敗しました:', error);
            // エラーメッセージを表示
            homeGallery.innerHTML = `
                <p>ギャラリーデータの読み込みに失敗しました。</p>
                <p>エラー: ${error.message}</p>
            `;
        });
    
    /**
     * ギャラリーデータからランダムに5枚を選び表示する
     * @param {Array} data - ギャラリー画像データの配列
     */
    function displayRandomImages(data) {
        // データをシャッフル
        const shuffled = shuffleArray([...data]);
        
        // 最大5枚（またはデータの長さが5未満の場合はその数）を選択
        const selectedImages = shuffled.slice(0, Math.min(5, shuffled.length));
        
        // ギャラリープレビューをクリア
        homeGallery.innerHTML = '';
        
        // 選択された画像を表示
        selectedImages.forEach(item => {
            const galleryItem = document.createElement('div');
            galleryItem.classList.add('home-gallery-item');
            
            const title = item.title || formatFileName(item.alt || '');
            const category = formatCategoryName(item.category || 'art');
            
            galleryItem.innerHTML = `
                <div class="img-container">
                    <img src="${item.src}" alt="${item.alt}" onerror="this.onerror=null; this.src='${FALLBACK_IMAGE_PATH}';">
                </div>
                <div class="home-gallery-item-info">
                    <h3>${title}</h3>
                    <p>${category}</p>
                </div>
            `;
            
            homeGallery.appendChild(galleryItem);
            
            // クリック時の挙動（モーダル表示）
            galleryItem.addEventListener('click', function() {
                const img = this.querySelector('img');
                showModal(img.src, item.alt, item.title);
            });
            
            // 画像のロード状態をログに記録
            const img = galleryItem.querySelector('img');
            img.addEventListener('load', function() {
                console.log('画像が正常に読み込まれました:', this.src);
            });
            
            img.addEventListener('error', function() {
                console.warn('画像の読み込みに失敗しました:', this.src, '- フォールバック画像を使用します');
            });
        });
    }
    
    /**
     * モーダルを表示する
     * @param {string} imgSrc - 表示する画像のパス
     * @param {string} alt - 画像の代替テキスト
     * @param {string} title - 画像のタイトル
     */
    function showModal(imgSrc, alt, title) {
        // 既存のモーダルを削除
        const existingModal = document.querySelector('.gallery-modal');
        if (existingModal) {
            document.body.removeChild(existingModal);
        }
        
        const modal = document.createElement('div');
        modal.classList.add('gallery-modal');
        modal.style.display = 'block'; // 明示的に表示
        
        modal.innerHTML = `
            <div class="modal-content">
                <span class="modal-close">&times;</span>
                <img src="${imgSrc}" alt="${alt}" onerror="this.onerror=null; this.src='${FALLBACK_IMAGE_PATH}';">
                ${title ? `<h3 class="modal-title">${title}</h3>` : ''}
                <a href="gallery.html" class="view-more-btn">ギャラリーをもっと見る</a>
            </div>
        `;
        
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
        
        // モーダルを閉じる
        modal.querySelector('.modal-close').addEventListener('click', function() {
            document.body.removeChild(modal);
            document.body.style.overflow = '';
        });
        
        // 背景クリックでも閉じる
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                document.body.removeChild(modal);
                document.body.style.overflow = '';
            }
        });
        
        // ESCキーでも閉じる
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && document.querySelector('.gallery-modal')) {
                document.body.removeChild(modal);
                document.body.style.overflow = '';
            }
        });
    }
    
    // 配列をランダムにシャッフルする関数（Fisher-Yatesアルゴリズム）
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    // カテゴリ名をフォーマット
    function formatCategoryName(category) {
        if (!category) return '';
        return category
            .replace(/_/g, ' ')
            .replace(/\b\w/g, char => char.toUpperCase());
    }
    
    // ファイル名から表示用タイトルを生成
    function formatFileName(fileName) {
        if (!fileName) return 'Untitled';
        return fileName
            .replace(/[0-9-_\.]/g, ' ')
            .trim() || 'Untitled';
    }
}