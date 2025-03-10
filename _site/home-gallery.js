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
    

    
    // JSONファイルからデータを読み込む試み
    fetch('./assets/js/gallery-data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('JSONファイルが見つかりません');
            }
            return response.json();
        })
        .then(data => {
            console.log('JSONからギャラリーデータを読み込みました', data.length + '件');
            galleryData = data;
            displayRandomImages(galleryData);
        })
        .catch(error => {
            console.warn('JSONからの読み込みに失敗しました。デフォルトデータを使用します:', error);
            displayRandomImages(galleryData);
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
            
            galleryItem.innerHTML = `
                <img src="${item.src}" alt="${item.alt}" onerror="this.src='./assets/placeholder.jpg'">
                <div class="home-gallery-item-info">
                    <h3>${item.title || item.alt}</h3>
                </div>
            `;
            
            homeGallery.appendChild(galleryItem);
            
            // クリック時の挙動（オプション: モーダル表示またはギャラリーページへリンク）
            galleryItem.addEventListener('click', function() {
                // モーダル表示の場合
                const imgSrc = this.querySelector('img').src;
                const modal = document.createElement('div');
                modal.classList.add('gallery-modal');
                
                modal.innerHTML = `
                    <div class="modal-content">
                        <span class="modal-close">&times;</span>
                        <img src="${imgSrc}" alt="">
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
            });
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
} 