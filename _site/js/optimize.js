/**
 * Performance Optimization Utilities
 * パフォーマンス最適化ユーティリティクラス
 */
class PerformanceOptimizer {
  /**
   * Initialize performance optimizations
   * パフォーマンス最適化の初期化
   */
  constructor() {
    this.initLazyLoading();
    this.initImageOptimization();
  }
  
  /**
   * Initialize lazy loading for images
   * 画像の遅延読み込みを初期化
   */
  initLazyLoading() {
    // Check if Intersection Observer is supported
    if ('IntersectionObserver' in window) {
      const lazyImgObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const lazyImg = entry.target;
            const src = lazyImg.dataset.src;
            
            if (src) {
              lazyImg.src = src;
              lazyImg.classList.add('loaded');
              lazyImg.removeAttribute('data-src');
              observer.unobserve(lazyImg);
            }
          }
        });
      });
      
      // Observe all images with data-src attribute
      const lazyImages = document.querySelectorAll('img[data-src]');
      lazyImages.forEach(img => {
        lazyImgObserver.observe(img);
      });
    } else {
      // Fallback for browsers that don't support Intersection Observer
      this.lazyLoadImagesLegacy();
    }
  }
  
  /**
   * Legacy method for lazy loading images in browsers without Intersection Observer
   * Intersection Observerをサポートしないブラウザ向けの遅延読み込みレガシー実装
   */
  lazyLoadImagesLegacy() {
    let lazyImages = Array.from(document.querySelectorAll('img[data-src]'));
    let active = false;
    
    const lazyLoad = () => {
      if (active === false) {
        active = true;
        
        setTimeout(() => {
          lazyImages.forEach(lazyImg => {
            if (
              lazyImg.getBoundingClientRect().top <= window.innerHeight &&
              lazyImg.getBoundingClientRect().bottom >= 0 &&
              getComputedStyle(lazyImg).display !== 'none'
            ) {
              lazyImg.src = lazyImg.dataset.src;
              lazyImg.classList.add('loaded');
              lazyImg.removeAttribute('data-src');
              
              lazyImages = lazyImages.filter(img => img !== lazyImg);
              
              if (lazyImages.length === 0) {
                document.removeEventListener('scroll', lazyLoad);
                window.removeEventListener('resize', lazyLoad);
                window.removeEventListener('orientationchange', lazyLoad);
              }
            }
          });
          
          active = false;
        }, 200);
      }
    };
    
    document.addEventListener('scroll', lazyLoad);
    window.addEventListener('resize', lazyLoad);
    window.addEventListener('orientationchange', lazyLoad);
    lazyLoad();
  }
  
  /**
   * Initialize image optimization features
   * 画像最適化機能の初期化
   */
  initImageOptimization() {
    // Add support for WebP detection
    this.checkWebpSupport().then(webpSupported => {
      if (webpSupported) {
        document.documentElement.classList.add('webp');
        this.replaceImagesWithWebP();
      }
    });
  }
  
  /**
   * Check if browser supports WebP format
   * ブラウザがWebP形式をサポートしているかをチェック
   * @returns {Promise<boolean>} - Promise resolving to true if WebP is supported
   */
  checkWebpSupport() {
    return new Promise(resolve => {
      const webpImage = new Image();
      webpImage.onload = function() {
        resolve(webpImage.width > 0 && webpImage.height > 0);
      };
      webpImage.onerror = function() {
        resolve(false);
      };
      webpImage.src = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
    });
  }
  
  /**
   * Replace standard images with WebP versions where available
   * 利用可能な場合、標準画像をWebPバージョンに置き換え
   */
  replaceImagesWithWebP() {
    const images = document.querySelectorAll('img[data-webp]');
    images.forEach(img => {
      const webpSrc = img.dataset.webp;
      if (webpSrc) {
        if (img.dataset.src) {
          img.dataset.src = webpSrc;
        } else {
          img.src = webpSrc;
        }
      }
    });
  }
}

// Initialize performance optimizations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const optimizer = new PerformanceOptimizer();
}); 