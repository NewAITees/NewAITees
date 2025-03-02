/**
 * gallery-generator.js
 * フォルダ内の画像ファイルをスキャンし、ギャラリーデータをJSONファイルとして出力するスクリプト
 * 
 * 使用方法:
 * 1. Node.jsをインストール
 * 2. このスクリプトを実行: node gallery-generator.js
 */

const fs = require('fs');
const path = require('path');

// ギャラリーのルートディレクトリ
const GALLERY_ROOT = './assets/gallery';

// サポートされている画像拡張子
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];

// 結果を保存するJSONファイル
const OUTPUT_FILE = './assets/js/gallery-data.json';

/**
 * フォルダ内の画像ファイルをスキャンする関数
 */
function scanGalleryFolders() {
  // 結果を格納する配列
  const galleryData = [];
  
  try {
    // ルートディレクトリが存在するか確認
    if (!fs.existsSync(GALLERY_ROOT)) {
      console.error(`エラー: ギャラリーフォルダが見つかりません: ${GALLERY_ROOT}`);
      return galleryData;
    }
    
    // カテゴリフォルダを取得
    const categoryFolders = fs.readdirSync(GALLERY_ROOT, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    console.log(`カテゴリフォルダを検出: ${categoryFolders.join(', ')}`);
    
    // 各カテゴリフォルダをスキャン
    categoryFolders.forEach(category => {
      const categoryPath = path.join(GALLERY_ROOT, category);
      
      // フォルダ内のファイルを取得
      const files = fs.readdirSync(categoryPath);
      
      // 画像ファイルをフィルタリング
      const imageFiles = files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return IMAGE_EXTENSIONS.includes(ext);
      });
      
      console.log(`"${category}" カテゴリに ${imageFiles.length} 枚の画像を発見`);
      
      // ギャラリーデータに追加
      imageFiles.forEach(file => {
        const filePath = path.join(GALLERY_ROOT, category, file).replace(/\\/g, '/');
        const relativePath = `./${filePath}`; // HTML/JSから相対パスで参照するため
        
        galleryData.push({
          src: relativePath,
          alt: path.basename(file, path.extname(file)).replace(/[-_]/g, ' '),
          category: category,
          title: path.basename(file, path.extname(file)).replace(/[-_0-9]/g, ' ').trim()
        });
      });
    });
    
    console.log(`合計 ${galleryData.length} 枚の画像を処理しました`);
    
    // 結果をJSONとして保存
    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(galleryData, null, 2));
    console.log(`ギャラリーデータを保存しました: ${OUTPUT_FILE}`);
    
    return galleryData;
    
  } catch (error) {
    console.error('スキャン処理中にエラーが発生しました:', error);
    return galleryData;
  }
}

// スクリプトを実行
scanGalleryFolders(); 