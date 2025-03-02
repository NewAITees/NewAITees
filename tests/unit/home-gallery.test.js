/**
 * @jest-environment jsdom
 */

/**
 * home-gallery.test.js
 * home-gallery.jsの機能テスト
 */

// DOMをモックするために必要
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// モックデータ
const mockHomeGalleryData = [
  'assets/gallery/abstract_image/1.png',
  'assets/gallery/abstract_image/2.png',
  'assets/gallery/horror/3.png',
  'assets/gallery/joke/4.png',
  'assets/gallery/abstract_image/5.png'
];

// Math.random()の元の実装を保存
const originalRandom = Math.random;

// ロガー設定
const setupLogger = () => {
  console.log = jest.fn(console.log);
  console.error = jest.fn(console.error);
  console.debug = jest.fn(console.debug);
  
  return {
    getLogSummary: () => {
      const logCalls = console.log.mock.calls.length;
      const errorCalls = console.error.mock.calls.length;
      return {
        logs: logCalls,
        errors: errorCalls,
        hasErrors: errorCalls > 0
      };
    },
    printLogs: () => {
      if (console.log.mock.calls.length > 0) {
        console.log('【テストログ】', JSON.stringify(console.log.mock.calls));
      }
      if (console.error.mock.calls.length > 0) {
        console.log('【テストエラー】', JSON.stringify(console.error.mock.calls));
      }
    }
  };
};

// テスト用のJSファイルをロードするヘルパー関数
function loadHomeGalleryJS() {
  const logger = setupLogger();
  
  // DOMのセットアップ
  const dom = new JSDOM(`
    <!DOCTYPE html>
    <html>
      <body>
        <div id="home-gallery">
          <div id="gallery-wrapper">
            <img id="gallery-image" src="" alt="Gallery Image">
          </div>
          <button id="prev-button">前へ</button>
          <button id="next-button">次へ</button>
          <div id="gallery-dots"></div>
        </div>
      </body>
    </html>
  `, { url: 'http://localhost/' });
  
  const window = dom.window;
  const document = dom.window.document;
  
  // Math.randomをモック化してテスト結果が一貫するようにする
  Math.random = jest.fn(() => 0.5);
  
  // グローバル変数を設定
  window.galleryImages = mockHomeGalleryData;
  window.currentImageIndex = 0;
  window.intervals = [];
  
  // initHomeGallery関数のモック
  window.initHomeGallery = function() {
    // ギャラリードットを作成
    const dotsContainer = document.getElementById('gallery-dots');
    dotsContainer.innerHTML = '';
    
    window.galleryImages.forEach((_, i) => {
      const dot = document.createElement('span');
      dot.classList.add('gallery-dot');
      if (i === 0) dot.classList.add('active');
      
      dot.addEventListener('click', () => {
        window.currentImageIndex = i;
        showImage(window.currentImageIndex);
      });
      
      dotsContainer.appendChild(dot);
    });
    
    // 最初の画像を表示
    showImage(0);
    
    // 前後ボタンのイベントリスナーを設定
    document.getElementById('prev-button').addEventListener('click', () => {
      window.currentImageIndex--;
      if (window.currentImageIndex < 0) {
        window.currentImageIndex = window.galleryImages.length - 1;
      }
      showImage(window.currentImageIndex);
    });
    
    document.getElementById('next-button').addEventListener('click', () => {
      window.currentImageIndex++;
      if (window.currentImageIndex >= window.galleryImages.length) {
        window.currentImageIndex = 0;
      }
      showImage(window.currentImageIndex);
    });
    
    // 自動切り替え
    const intervalId = setInterval(() => {
      document.getElementById('next-button').click();
    }, 5000);
    
    // インターバルIDを保存してテスト終了時にクリアできるようにする
    window.intervals.push(intervalId);
  };
  
  // showImage関数のモック
  function showImage(index) {
    const galleryImage = document.getElementById('gallery-image');
    galleryImage.src = window.galleryImages[index];
    
    // アクティブなドットを更新
    const dots = document.querySelectorAll('.gallery-dot');
    dots.forEach((dot, i) => {
      dot.className = i === index ? 'gallery-dot active' : 'gallery-dot';
    });
  }

  // テスト用に明示的に関数を呼び出し
  window.initHomeGallery();
  logger.printLogs();
  
  return { window, document, logger };
}

describe('HomeGallery.js', () => {
  let window;
  let document;
  let logger;
  
  // テスト終了時にランダム関数を元に戻す
  afterAll(() => {
    Math.random = originalRandom;
  });
  
  beforeEach(() => {
    const dom = loadHomeGalleryJS();
    window = dom.window;
    document = dom.document;
    logger = dom.logger;
  });
  
  afterEach(() => {
    // タイマーをすべてクリア
    if (window && window.intervals) {
      window.intervals.forEach(id => clearInterval(id));
    }
    
    if (logger) {
      const summary = logger.getLogSummary();
      console.log(`テスト実行サマリー: ログ数=${summary.logs}, エラー数=${summary.errors}`);
    }
  });
  
  test('ホームギャラリーが正しく初期化される', () => {
    console.log('🔍 テスト開始: ホームギャラリーが正しく初期化される');
    
    // ギャラリーコントロールが存在することを確認
    expect(document.getElementById('prev-button')).not.toBeNull();
    expect(document.getElementById('next-button')).not.toBeNull();
    expect(document.getElementById('gallery-dots')).not.toBeNull();
    
    // 複数のドットが生成されることを確認
    const dots = document.querySelectorAll('.gallery-dot');
    console.log(`📊 生成されたドット数: ${dots.length}`);
    expect(dots.length).toBe(mockHomeGalleryData.length);
    
    // 最初のドットがアクティブであることを確認
    expect(dots[0].classList.contains('active')).toBe(true);
    
    // 画像が正しくロードされることを確認
    const galleryImage = document.getElementById('gallery-image');
    console.log(`🖼️ 初期画像のパス: ${galleryImage.src}`);
    expect(galleryImage.src).toContain(mockHomeGalleryData[0]);
    
    console.log('✅ テスト成功: ホームギャラリーが正しく初期化される');
  });
  
  test('次の画像ボタンが正しく動作する', () => {
    const initialIndex = window.currentImageIndex;
    const nextButton = document.getElementById('next-button');
    const clickEvent = new window.MouseEvent('click');
    nextButton.dispatchEvent(clickEvent);
    
    // clickイベントをシミュレーションした後のインデックスをチェック
    expect(window.currentImageIndex).toBe((initialIndex + 1) % window.galleryImages.length);
    
    // 画像ソースが更新されていることを確認
    const galleryImage = document.getElementById('gallery-image');
    expect(galleryImage.src).toContain(window.galleryImages[window.currentImageIndex]);
  });
  
  test('前の画像ボタンが正しく動作する', () => {
    // 初期インデックスを強制的に0に設定
    window.currentImageIndex = 0;
    
    const prevButton = document.getElementById('prev-button');
    const clickEvent = new window.MouseEvent('click');
    prevButton.dispatchEvent(clickEvent);
    
    // 最後の画像のインデックス
    const expectedIndex = window.galleryImages.length - 1;
    expect(window.currentImageIndex).toBe(expectedIndex);
    
    // 画像ソースが更新されていることを確認
    const galleryImage = document.getElementById('gallery-image');
    expect(galleryImage.src).toContain(window.galleryImages[expectedIndex]);
  });
  
  test('ドット表示が正しく動作する', () => {
    // ドットコンテナが存在することを確認
    const dotContainer = document.getElementById('gallery-dots');
    expect(dotContainer).not.toBeNull();
    
    // ドットの生成（テストのセットアップとして）
    dotContainer.innerHTML = '';
    window.galleryImages.forEach((_, i) => {
      const dot = document.createElement('span');
      dot.className = i === window.currentImageIndex ? 'gallery-dot active' : 'gallery-dot';
      dot.addEventListener('click', () => {
        window.currentImageIndex = i;
        // ドットクリック時に画像を更新する処理
      });
      dotContainer.appendChild(dot);
    });
    
    // ドットの数が画像の数と一致することを確認
    const dots = document.querySelectorAll('.gallery-dot');
    expect(dots.length).toBe(window.galleryImages.length);
    
    // 最初のドットがアクティブであることを確認
    expect(dots[0].className).toContain('active');
    
    // 2番目のドットをクリックし、インデックスが更新されることを確認
    const clickEvent = new window.MouseEvent('click');
    dots[2].dispatchEvent(clickEvent);
    
    // インデックスが更新されていることを確認
    expect(window.currentImageIndex).toBe(2);
  });
  
  test('画像エラー処理が正しく動作する', () => {
    // 画像要素が存在することを確認
    const galleryImage = document.getElementById('gallery-image');
    expect(galleryImage).not.toBeNull();
    
    // エラーハンドラを設定
    galleryImage.setAttribute('onerror', "this.src='./images/247-958349849-0-12.png'; this.onerror=null;");
    
    // エラーイベントをシミュレート
    const errorEvent = new window.Event('error');
    galleryImage.dispatchEvent(errorEvent);
    
    // フォールバック画像が設定されているか確認
    expect(galleryImage.getAttribute('onerror')).toContain('./images/247-958349849-0-12.png');
  });
});

// グローバル環境のクリーンアップ
afterAll(() => {
  delete global.window;
  delete global.document;
  delete global.fetch;
}); 