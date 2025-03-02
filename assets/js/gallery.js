/**
 * ギャラリー機能を管理するJavaScriptファイル
 * 画像フィルタリングやモーダル表示などを制御
 */

// DOMが読み込まれたら実行
document.addEventListener('DOMContentLoaded', () => {
  console.log('Gallery script loaded');
  
  // この時点では基本構造のみを作成
  // 詳細な機能は個別ページで実装
}); 

/**
* Gallery Manager class to handle gallery functionality
* ギャラリーの機能を管理するクラス
*/
class GalleryManager {
/**
 * Initialize the gallery manager
 * ギャラリーマネージャーの初期化
 */
constructor() {
  // Gallery elements
  this.galleryContainer = document.querySelector('.gallery-container');
  this.filterButtons = document.querySelectorAll('.filter-btn');
  this.modal = document.getElementById('gallery-modal');
  this.modalImg = document.getElementById('modal-img');
  this.modalCaption = document.getElementById('modal-caption');
  this.closeBtn = document.querySelector('.modal-close');
  this.prevBtn = document.getElementById('prev-btn');
  this.nextBtn = document.getElementById('next-btn');
  
  // Gallery state
  this.images = [];
  this.currentFilter = 'all';
  this.currentIndex = 0;
  this.filteredImages = [];
  
  // 各カテゴリの最大表示数
  this.maxItemsPerCategory = 10;
  
  // Initialize gallery
  this.init();
}

/**
 * Initialize the gallery
 * ギャラリーの初期化処理
 */
init() {
  // Load gallery data
  this.loadGalleryData();
  
  // Setup event listeners
  this.setupEventListeners();
  
  // Setup lazy loading
  this.setupLazyLoading();
}

/**
 * Load gallery data from JSON or predefined array
 * ギャラリーデータの読み込み
 */
loadGalleryData() {
  // 外部JSONからデータを読み込むため、サンプルデータは不要です
  this.images = [];
  
  // 外部JSONからデータを読み込む
  fetch('./assets/js/gallery-data.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('JSONファイルの読み込みに失敗しました');
      }
      return response.json();
    })
    .then(data => {
      this.images = data;
      
      // カテゴリごとの表示数を制限
      this.images = this.limitImagesByCategory(this.images);
      
      // Initialize with all images
      this.filteredImages = [...this.images];
      
      // ギャラリーを表示
      this.renderGallery();
    })
    .catch(error => {
      console.error('ギャラリーデータの読み込みエラー:', error);
      // エラーメッセージを表示
      const gallery = document.getElementById('gallery');
      if (gallery) {
        gallery.innerHTML = '<p class="error-message">ギャラリーデータの読み込みに失敗しました。</p>';
      }
    });
}

/**
 * 各カテゴリごとに画像を最大数まで制限する
 * Limit images per category to the maximum allowed
 * @param {Array} images - The full list of images
 * @returns {Array} - The limited list of images
 */
limitImagesByCategory(images) {
  // カテゴリごとにイメージをグループ化
  const categoryCounts = {};
  const categorizedImages = {};
  const limitedImages = [];
  
  // カテゴリごとのイメージを収集
  images.forEach(image => {
    image.categories.forEach(category => {
      if (!categorizedImages[category]) {
        categorizedImages[category] = [];
      }
      categorizedImages[category].push(image);
    });
  });
  
  // 各カテゴリごとにシャッフルして制限
  for (const category in categorizedImages) {
    // カテゴリ内でシャッフル
    const shuffled = this.shuffleArray([...categorizedImages[category]]);
    // 最大数だけ選択
    const limited = shuffled.slice(0, this.maxItemsPerCategory);
    
    // 結果に追加 (重複を避けるためにIDでチェック)
    limited.forEach(image => {
      if (!limitedImages.some(img => img.id === image.id)) {
        limitedImages.push(image);
      }
    });
  }
  
  return limitedImages;
}

/**
 * 配列をランダムにシャッフル (Fisher-Yates algorithm)
 * @param {Array} array - The array to shuffle
 * @returns {Array} - The shuffled array
 */
shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Set up event listeners for gallery interactions
 * ギャラリー操作のイベントリスナー設定
 */
setupEventListeners() {
  // Filter button click events
  this.filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Update active button UI
      this.filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      // Apply filter
      this.currentFilter = button.dataset.filter;
      this.applyFilter();
    });
  });
  
  // Modal events
  this.closeBtn.addEventListener('click', () => this.closeModal());
  window.addEventListener('click', (e) => {
    if (e.target === this.modal) this.closeModal();
  });
  
  // Navigation buttons
  this.prevBtn.addEventListener('click', () => this.navigateImage(-1));
  this.nextBtn.addEventListener('click', () => this.navigateImage(1));
  
  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!this.modal.style.display || this.modal.style.display === 'none') return;
    
    if (e.key === 'Escape') this.closeModal();
    if (e.key === 'ArrowLeft') this.navigateImage(-1);
    if (e.key === 'ArrowRight') this.navigateImage(1);
  });
}

/**
 * Set up lazy loading for gallery images using Intersection Observer
 * Intersection Observerを使用した画像の遅延読み込み
 */
setupLazyLoading() {
  const options = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };
  
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target.querySelector('img');
        const src = img.dataset.src;
        if (src) {
          img.src = src;
          img.removeAttribute('data-src');
        }
        observer.unobserve(entry.target);
      }
    });
  }, options);
  
  // Observe all gallery items
  const galleryItems = document.querySelectorAll('.gallery-item');
  galleryItems.forEach(item => {
    observer.observe(item);
  });
}

/**
 * Apply the current filter to the image gallery
 * 現在のフィルターをギャラリーに適用
 */
applyFilter() {
  if (this.currentFilter === 'all') {
    this.filteredImages = [...this.images];
  } else {
    this.filteredImages = this.images.filter(image => 
      image.categories.includes(this.currentFilter)
    );
  }
  
  this.renderGallery();
}

/**
 * Render the gallery based on filtered images
 * フィルタリングされた画像を元にギャラリーを描画
 */
renderGallery() {
  // Clear gallery container
  this.galleryContainer.innerHTML = '';
  
  // Create gallery items
  this.filteredImages.forEach((image, index) => {
    const galleryItem = document.createElement('div');
    galleryItem.className = 'gallery-item';
    galleryItem.dataset.index = index;
    
    galleryItem.innerHTML = `
      <img data-src="${image.thumbnail}" alt="${image.title}" loading="lazy">
      <div class="gallery-item-info">
        <h3>${image.title}</h3>
        <p>${image.description}</p>
      </div>
    `;
    
    // Add click event to open modal
    galleryItem.addEventListener('click', () => {
      this.openModal(index);
    });
    
    this.galleryContainer.appendChild(galleryItem);
  });
  
  // Refresh lazy loading
  this.setupLazyLoading();
}

/**
 * Open the modal with the selected image
 * 選択された画像でモーダルを開く
 * @param {number} index - The index of the image to display
 */
openModal(index) {
  this.currentIndex = index;
  const image = this.filteredImages[index];
  
  this.modalImg.src = image.src;
  this.modalCaption.textContent = `${image.title} - ${image.description}`;
  this.modal.style.display = 'block';
  
  // Update navigation button states
  this.updateNavigationButtons();
}

/**
 * Close the image modal
 * 画像モーダルを閉じる
 */
closeModal() {
  this.modal.style.display = 'none';
}

/**
 * Navigate between images in the modal
 * モーダル内で画像を切り替える
 * @param {number} direction - The direction to navigate (-1 for previous, 1 for next)
 */
navigateImage(direction) {
  this.currentIndex += direction;
  
  // Ensure index is within bounds
  if (this.currentIndex < 0) {
    this.currentIndex = 0;
  } else if (this.currentIndex >= this.filteredImages.length) {
    this.currentIndex = this.filteredImages.length - 1;
  }
  
  // Update modal content
  const image = this.filteredImages[this.currentIndex];
  this.modalImg.src = image.src;
  this.modalCaption.textContent = `${image.title} - ${image.description}`;
  
  // Update navigation button states
  this.updateNavigationButtons();
}

/**
 * Update the state of navigation buttons based on current index
 * 現在のインデックスに基づいてナビゲーションボタンの状態を更新
 */
updateNavigationButtons() {
  this.prevBtn.disabled = this.currentIndex === 0;
  this.nextBtn.disabled = this.currentIndex === this.filteredImages.length - 1;
  
  this.prevBtn.style.opacity = this.prevBtn.disabled ? '0.5' : '1';
  this.nextBtn.style.opacity = this.nextBtn.disabled ? '0.5' : '1';
}
}

// Initialize Gallery when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
const gallery = new GalleryManager();
});

/**
 * グローバルで利用可能な初期化関数
 * テスト用およびグローバルアクセス用
 * @returns {Promise} ギャラリーの初期化プロセスを表すプロミス
 */
window.initGallery = async function() {
  console.log('Initializing gallery globally...');
  
  try {
    // gallery-data.jsonからデータを取得
    const response = await fetch('./assets/js/gallery-data.json');
    const galleryData = await response.json();
    
    // 各カテゴリごとに最大10件までの画像に制限
    const MAX_IMAGES_PER_CATEGORY = 10;
    let limitedGalleryData = {};
    
    // 各カテゴリのデータを制限
    Object.keys(galleryData).forEach(category => {
      limitedGalleryData[category] = galleryData[category].slice(0, MAX_IMAGES_PER_CATEGORY);
    });
    
    // 初期化済みのフィルタリング済み画像
    const filteredImages = [];
    Object.keys(limitedGalleryData).forEach(category => {
      limitedGalleryData[category].forEach(item => {
        filteredImages.push(item);
      });
    });
    
    // renderGallery関数を呼び出して画像を表示
    renderGallery(filteredImages);
    
    return limitedGalleryData;
  } catch (error) {
    console.error('Gallery initialization failed:', error);
    throw error;
  }
};