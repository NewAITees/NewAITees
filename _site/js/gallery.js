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
    // Sample image data - in a real scenario, this would be loaded from a JSON file or API
    this.images = [
      {
        id: 1,
        src: 'assets/images/gallery/digital/image1.jpg',
        thumbnail: 'assets/images/gallery/digital/thumbs/image1.jpg',
        title: 'Digital Artwork 1',
        description: 'A colorful digital illustration',
        categories: ['digital', 'character']
      },
      {
        id: 2,
        src: 'assets/images/gallery/traditional/image2.jpg',
        thumbnail: 'assets/images/gallery/traditional/thumbs/image2.jpg',
        title: 'Traditional Artwork 1',
        description: 'A traditional painting using watercolor',
        categories: ['traditional']
      },
      {
        id: 3,
        src: 'assets/images/gallery/sketch/image3.jpg',
        thumbnail: 'assets/images/gallery/sketch/thumbs/image3.jpg',
        title: 'Sketch 1',
        description: 'A pencil sketch of a landscape',
        categories: ['sketch']
      },
      // Add more images here...
    ];
    
    // Initialize with all images
    this.filteredImages = [...this.images];
    
    // Render gallery
    this.renderGallery();
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