/**
 * メインのJavaScriptファイル
 * ページ全体の共通機能を管理
 */

// DOMが読み込まれたら実行
document.addEventListener('DOMContentLoaded', () => {
    // スムーススクロール機能
    setupSmoothScroll();
    
    // ヘッダーのスクロール挙動
    setupHeaderScroll();
});

/**
 * アンカーリンクのスムーススクロール機能を設定
 */
function setupSmoothScroll() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetId = link.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (!targetElement) return;
            
            const headerHeight = document.querySelector('#header').offsetHeight;
            const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        });
    });
}

/**
 * ヘッダーのスクロール時の挙動を設定
 * スクロールするとヘッダーの背景を少し不透明にする
 */
function setupHeaderScroll() {
    const header = document.querySelector('#header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
} 