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
    if (!response.ok) {
      throw new Error(`Gallery data could not be loaded: ${response.status}`);
    }
    
    const galleryData = await response.json();
    console.log(`gallery-data.jsonから${galleryData.length}件のデータを読み込みました`);
    
    // カテゴリ情報を配列形式に変換
    const processedData = galleryData.map(item => ({
      ...item,
      categories: Array.isArray(item.categories) ? item.categories : [item.category],
      thumbnail: item.thumbnail || item.src,
      src: item.src.startsWith('./') ? item.src : './' + item.src
    }));
    
    // グローバル変数に確実に保存
    window.galleryImages = processedData;
    
    // カテゴリ一覧を取得（重複を除去）
    const categories = Array.from(new Set(
      processedData.flatMap(item => item.categories)
    ));
    
    // フィルターボタンを生成
    generateFilterButtons(categories);
    
    // 初期表示（すべての画像）
    window.renderGallery(window.galleryImages);
    
    return window.galleryImages.length;
  } catch (error) {
    console.error('Gallery initialization failed:', error);
    // エラーメッセージを表示
    const gallery = document.getElementById('gallery');
    if (gallery) {
      gallery.innerHTML = '<p class="error-message">ギャラリーデータの読み込みに失敗しました。</p>';
    }
    return 0;
  }
};

/**
 * カテゴリフィルターボタンを生成する
 * @param {Array} categories カテゴリ一覧
 */
function generateFilterButtons(categories) {
  const filtersContainer = document.querySelector('.gallery-filters');
  if (!filtersContainer) {
    console.error('フィルターコンテナが見つかりません');
    return;
  }
  
  // "すべて表示"ボタンの確実な検出と処理
  const allButton = filtersContainer.querySelector('.filter-btn[data-filter="all"]');
  
  // 既存のイベントリスナーをクリア（重複防止）
  if (allButton) {
    const newAllButton = allButton.cloneNode(true);
    if (allButton.parentNode) {
      allButton.parentNode.replaceChild(newAllButton, allButton);
    }
    
    // 新しいイベントリスナーを追加
    newAllButton.addEventListener('click', function() {
      console.log('「すべて表示」ボタンがクリックされました');
      // アクティブ状態の更新
      document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      
      // ギャラリー表示更新
      if (window.galleryImages && Array.isArray(window.galleryImages)) {
        console.log(`ギャラリー更新: ${window.galleryImages.length}件の画像を表示します`);
        window.renderGallery(window.galleryImages);
      } else {
        console.error('ギャラリーデータが利用できません');
      }
    });
  } else {
    console.error('「すべて表示」ボタンが見つかりません');
  }
  
  // 既存のボタン（"すべて表示"以外）を削除
  const existingButtons = filtersContainer.querySelectorAll('.filter-btn:not([data-filter="all"])');
  existingButtons.forEach(btn => btn.remove());
  
  // カテゴリごとにボタンを追加
  categories.forEach(category => {
    const button = document.createElement('button');
    button.className = 'filter-btn';
    button.dataset.filter = category;
    button.textContent = formatCategoryName(category);
    
    // クリックイベントを追加
    button.addEventListener('click', () => {
      // アクティブボタンの更新
      document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      // フィルタリング実行
      const filtered = window.galleryImages.filter(img => img.categories.includes(category));
      window.renderGallery(filtered);
    });
    
    filtersContainer.appendChild(button);
  });
}

/**
 * カテゴリ名を表示用にフォーマット
 * @param {string} category カテゴリ名
 * @returns {string} 表示用カテゴリ名
 */
function formatCategoryName(category) {
  return category
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * ギャラリーを描画する関数
 * @param {Array} images 表示する画像の配列
 */
window.renderGallery = function(images) {
  const galleryContainer = document.getElementById('gallery');
  if (!galleryContainer) return;
  
  // ギャラリーをクリア
  galleryContainer.innerHTML = '';
  
  if (images.length === 0) {
    galleryContainer.innerHTML = '<p class="no-results">このカテゴリの画像はありません。</p>';
    return;
  }
  
  // 画像を表示
  images.forEach((image, index) => {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    
    const img = document.createElement('img');
    img.src = image.thumbnail || image.src;
    img.alt = image.alt || image.title || '';
    img.loading = 'lazy';
    
    const info = document.createElement('div');
    info.className = 'gallery-item-info';
    
    const title = document.createElement('h3');
    title.textContent = image.title || formatCategoryName(image.category);
    
    const desc = document.createElement('p');
    desc.textContent = image.description || '';
    
    info.appendChild(title);
    info.appendChild(desc);
    
    item.appendChild(img);
    item.appendChild(info);
    
    // クリックイベントでモーダル表示
    item.addEventListener('click', () => {
      openImageModal(image, index, images);
    });
    
    galleryContainer.appendChild(item);
  });
};

/**
 * 画像モーダルを開く
 * @param {Object} image 画像データ
 * @param {number} index インデックス
 * @param {Array} images 画像配列
 */
function openImageModal(image, index, images) {
  // 既存のモーダルを探す
  let modal = document.getElementById('gallery-modal');
  
  // モーダルがなければ作成
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'gallery-modal';
    modal.className = 'gallery-modal';
    
    // モーダルの内容を作成
    modal.innerHTML = `
      <div class="modal-content">
        <span class="modal-close">&times;</span>
        <img id="modal-img" src="" alt="">
        <div id="modal-caption"></div>
        <button id="prev-btn" class="modal-nav-btn">&#10094;</button>
        <button id="next-btn" class="modal-nav-btn">&#10095;</button>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // 閉じるボタンのイベント
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });
    
    // モーダル外クリックで閉じる
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  }
  
  // モーダル内の要素を取得
  const modalImg = document.getElementById('modal-img');
  const modalCaption = document.getElementById('modal-caption');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  
  // 画像とキャプションを設定
  modalImg.src = image.src;
  modalCaption.textContent = image.title || formatCategoryName(image.category);
  
  // ナビゲーションボタンの制御
  prevBtn.disabled = index === 0;
  nextBtn.disabled = index === images.length - 1;
  
  // 前後の画像に移動するイベント
  prevBtn.onclick = () => {
    if (index > 0) {
      openImageModal(images[index - 1], index - 1, images);
    }
  };
  
  nextBtn.onclick = () => {
    if (index < images.length - 1) {
      openImageModal(images[index + 1], index + 1, images);
    }
  };
  
  // モーダルを表示
  modal.style.display = 'block';
}

// ページ読み込み完了時に適切な順序で初期化を行う
document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM読み込み完了、ギャラリー初期化開始');
  
  try {
    // 初期化を確実に待つ
    const count = await window.initGallery();
    console.log(`ギャラリー初期化完了: ${count}件の画像をロードしました`);
    
    // すべてのボタンが正しくイベントを持つか確認
    document.querySelectorAll('.filter-btn').forEach(btn => {
      if (!btn.onclick && !btn.getAttribute('listener')) {
        console.warn(`ボタン "${btn.textContent}" にイベントリスナーがありません`);
        // イベントリスナーを再設定
        btn.addEventListener('click', function() {
          const filter = this.dataset.filter;
          console.log(`フィルター "${filter}" が選択されました`);
          
          // アクティブ状態を更新
          document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
          this.classList.add('active');
          
          // 該当フィルターでギャラリーを更新
          if (filter === 'all') {
            window.renderGallery(window.galleryImages);
          } else {
            const filtered = window.galleryImages.filter(img => img.categories.includes(filter));
            window.renderGallery(filtered);
          }
        });
        btn.setAttribute('listener', 'true');
      }
    });
  } catch (error) {
    console.error('ギャラリー初期化エラー:', error);
  }
});