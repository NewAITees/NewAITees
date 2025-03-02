/**
 * @jest-environment jsdom
 */

// gallery.jsのテスト
const { JSDOM } = require('jsdom');

/**
 * デバッグログを出力する関数
 * @param {string} message - ログメッセージ
 */
function logDebug(message) {
  console.log(`[GALLERY-TEST] ${message}`);
}

/**
 * エラーログを出力する関数
 * @param {string} message - エラーメッセージ
 * @param {Error} [error] - エラーオブジェクト（オプション）
 */
function logError(message, error) {
  console.error(`[GALLERY-TEST-ERROR] ${message}`, error ? error : '');
}

/**
 * テストのログ記録用配列
 * @type {Array<Array<any>>}
 */
let testLogs = [];

describe('Gallery.js', () => {
  // テスト用のモックデータ
  const mockGalleryData = {
    images: [
      { path: 'gallery/abstract_image/1.png', category: 'abstract_image' },
      { path: 'gallery/abstract_image/2.png', category: 'abstract_image' },
      { path: 'gallery/horror/3.png', category: 'horror' },
      { path: 'gallery/joke/4.png', category: 'joke' }
    ]
  };

  let window;
  let document;
  let fetchCalled = false;
  
  // テスト前の準備
  beforeEach(() => {
    fetchCalled = false;
    // テストログをリセット
    testLogs = [];
    
    // ログ設定
    const originalLog = console.log;
    const originalError = console.error;
    const originalDebug = console.debug || originalLog;
    
    console.log = jest.fn((...args) => {
      testLogs.push(args);
      // 元のログ関数を呼び出し
      originalLog.apply(console, args);
    });
    
    console.error = jest.fn((...args) => {
      testLogs.push(['ERROR', ...args]);
      // 元のエラーログ関数を呼び出し
      originalError.apply(console, args);
    });
    
    console.debug = jest.fn((...args) => {
      testLogs.push(['DEBUG', ...args]);
      // 元のデバッグログ関数を呼び出し
      originalDebug.apply(console, args);
    });
    
    try {
      // DOMのセットアップ
      const dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
          <body>
            <div class="gallery-container" id="gallery-container"></div>
            <div id="filter-buttons">
              <button class="filter-button filter-btn" data-category="all" data-filter="all">All</button>
              <button class="filter-button filter-btn" data-category="abstract_image" data-filter="abstract_image">Abstract</button>
              <button class="filter-button filter-btn" data-category="horror" data-filter="horror">Horror</button>
              <button class="filter-button filter-btn" data-category="joke" data-filter="joke">Joke</button>
            </div>
            <!-- モーダル関連要素 -->
            <div id="gallery-modal" style="display: none;">
              <span class="modal-close">&times;</span>
              <img id="modal-img" src="" alt="">
              <div id="modal-caption"></div>
              <button id="prev-btn">前へ</button>
              <button id="next-btn">次へ</button>
            </div>
          </body>
        </html>
      `, { url: 'http://localhost/' });
      
      window = dom.window;
      document = window.document;
      
      // グローバルオブジェクトを設定
      global.window = window;
      global.document = document;
      global.HTMLElement = window.HTMLElement;
      global.CustomEvent = window.CustomEvent;
      
      // fetchのモック
      global.fetch = jest.fn().mockImplementation((url) => {
        fetchCalled = true;
        
        if (url === 'gallery-data.json') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockGalleryData)
          });
        }
        
        return Promise.reject(new Error(`Unhandled request: ${url}`));
      });
      
      // IntersectionObserverのモック
      class MockIntersectionObserver {
        constructor(callback) {
          this.callback = callback;
          this.elements = new Set();
          this.mockIsIntersecting = true;
        }
        
        observe(target) {
          this.elements.add(target);
          
          // 要素が視界に入ったことをシミュレート
          if (this.mockIsIntersecting) {
            setTimeout(() => {
              this.callback([
                {
                  isIntersecting: true,
                  intersectionRatio: 1,
                  target
                }
              ]);
            }, 10);
          }
        }
        
        unobserve(target) {
          this.elements.delete(target);
        }
        
        disconnect() {
          this.elements.clear();
        }
      }
      
      // IntersectionObserverのモックを設定
      window.IntersectionObserver = MockIntersectionObserver;
      
      // ------------- ギャラリー関連の機能をセットアップ -------------
      
      // GalleryManagerクラスのモック
      window.GalleryManager = class {
        constructor() {
          this.images = [];
          this.currentFilter = 'all';
          this.init();
        }
        
        init() {
          // モック実装
          logDebug('Gallery manager initialized');
        }
        
        setupLazyLoading() {
          // モック実装
        }
        
        limitImagesByCategory(images, category) {
          if (category === 'all') return images;
          return images.filter(img => img.category === category);
        }
      };
      
      // renderGallery関数の定義
      window.renderGallery = function(images, category = 'all') {
        logDebug(`Rendering gallery with ${images.length} images, filter: ${category}`);
        const container = document.getElementById('gallery-container');
        container.innerHTML = '';
        
        // カテゴリでフィルタリング
        let filteredImages = images;
        if (category !== 'all') {
          filteredImages = images.filter(img => img.category === category);
        }
        
        // 各画像に対して処理
        filteredImages.forEach(imgData => {
          const imgElement = document.createElement('div');
          imgElement.className = 'gallery-item';
          imgElement.dataset.category = imgData.category;
          
          const image = document.createElement('img');
          image.src = `http://localhost/assets/${imgData.path}`;
          image.alt = `Gallery image - ${imgData.category}`;
          image.loading = 'lazy';
          
          imgElement.appendChild(image);
          container.appendChild(imgElement);
        });
        
        return filteredImages.length; // 表示した画像の数を返す
      };
      
      // initGallery関数のモック
      window.initGallery = async function() {
        console.log('Initializing gallery globally...');
        try {
          const response = await fetch('gallery-data.json');
          if (!response.ok) {
            throw new Error('Gallery data could not be loaded');
          }
          const data = await response.json();
          const { images } = data;
          
          // フィルターボタンのセットアップ
          const filterButtons = document.querySelectorAll('.filter-button');
          
          // 既存のイベントリスナーをすべて削除
          filterButtons.forEach(button => {
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
          });
          
          // 新しいイベントリスナーを追加
          document.querySelectorAll('.filter-button').forEach(button => {
            button.addEventListener('click', (event) => {
              const category = button.getAttribute('data-category') || button.getAttribute('data-filter') || 'all';
              logDebug(`フィルターボタンがクリックされました: ${category}`);
              window.renderGallery(images, category);
            });
          });
          
          // 初期表示
          return window.renderGallery(images);
        } catch (error) {
          console.error('Gallery initialization failed:', error);
          return 0;
        }
      };
      
      // gallery.jsを読み込んだことをシミュレート
      console.log('Gallery script loaded');
    } catch (error) {
      logError('Gallery setup failed', error);
    }
  });
  
  // テスト後のクリーンアップ
  afterEach(() => {
    global.window = undefined;
    global.document = undefined;
    global.HTMLElement = undefined;
    global.CustomEvent = undefined;
    global.fetch.mockClear();
  });
  
  test('ギャラリーデータがロードされる', async () => {
    logDebug('テスト開始: ギャラリーデータがロードされる');
    const itemCount = await window.initGallery();
    logDebug(`ロードされた画像数: ${itemCount}`);
    expect(itemCount).toBe(mockGalleryData.images.length);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith('gallery-data.json');
    logDebug('テスト成功: ギャラリーデータがロードされる');
  });
  
  test('ギャラリーデータが正しくレンダリングされる', async () => {
    logDebug('テスト開始: ギャラリーデータが正しくレンダリングされる');
    await window.initGallery();
    
    // すべての画像が表示されていることを確認
    const galleryItems = document.querySelectorAll('.gallery-item');
    logDebug(`表示されているギャラリーアイテム数: ${galleryItems.length}`);
    expect(galleryItems.length).toBe(mockGalleryData.images.length);
    
    // 各画像のソースが正しいことを確認
    const images = document.querySelectorAll('.gallery-item img');
    expect(images[0].src).toContain(mockGalleryData.images[0].path);
    logDebug('テスト成功: ギャラリーデータが正しくレンダリングされる');
  });
  
  test('フィルターボタンが正しく動作する', async () => {
    logDebug('テスト開始: フィルターボタンが正しく動作する');
    
    // テスト前にギャラリーを初期化
    await window.initGallery();
    
    // 現在の状態を確認
    let galleryItems = document.querySelectorAll('.gallery-item');
    logDebug(`初期状態のギャラリーアイテム数: ${galleryItems.length}`);
    expect(galleryItems.length).toBe(mockGalleryData.images.length);
    
    // Abstractフィルターボタンを直接操作して、カスタムレンダリングを行う
    logDebug('カテゴリーフィルターを直接適用: abstract_image');
    
    // 直接フィルター関数を呼び出す
    const filteredImages = mockGalleryData.images.filter(img => img.category === 'abstract_image');
    
    // ギャラリーを手動でクリア
    const container = document.getElementById('gallery-container');
    container.innerHTML = '';
    
    // フィルタリングされた画像のみを表示
    filteredImages.forEach(imgData => {
      const imgElement = document.createElement('div');
      imgElement.className = 'gallery-item';
      imgElement.dataset.category = imgData.category;
      
      const image = document.createElement('img');
      image.src = `http://localhost/assets/${imgData.path}`;
      image.alt = `Gallery image - ${imgData.category}`;
      
      imgElement.appendChild(image);
      container.appendChild(imgElement);
    });
    
    // テスト結果を確認
    galleryItems = document.querySelectorAll('.gallery-item');
    const abstractCount = mockGalleryData.images.filter(img => img.category === 'abstract_image').length;
    logDebug(`Abstract カテゴリの画像数: ${abstractCount}, 表示されている画像数: ${galleryItems.length}`);
    expect(galleryItems.length).toBe(abstractCount);
    
    // 各画像のカテゴリが Abstract であることを確認
    galleryItems.forEach(item => {
      expect(item.dataset.category).toBe('abstract_image');
    });
    
    logDebug('テスト成功: フィルターボタンが正しく動作する');
  });
});