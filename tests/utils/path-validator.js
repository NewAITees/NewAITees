/**
 * path-validator.js
 * HTMLファイル内のパス参照（CSS、JS、画像ファイルなど）を検証するユーティリティ
 * 404エラーの原因となる無効なパス参照を事前に検出します
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

// 検証するファイルタイプと対応する属性
const RESOURCE_TYPES = {
  'link[rel="stylesheet"]': 'href',
  'link[rel="preload"]': 'href',
  'script': 'src',
  'img': 'src',
  'a': 'href',
};

// 無視するパターン（CDNや外部リソースなど）
const IGNORE_PATTERNS = [
  /^https?:\/\//,
  /^\/\//,
  /^#/,
  /^mailto:/,
  /^tel:/,
  /^data:/,
];

// プロジェクトのルートディレクトリ
const ROOT_DIR = path.resolve(__dirname, '../../');

/**
 * 指定されたHTMLファイル内のリソースパスを検証する
 * @param {string} htmlFilePath - 検証するHTMLファイルのパス
 * @returns {Array} - エラーメッセージの配列
 */
async function validateHtmlFile(htmlFilePath) {
  const errors = [];
  
  try {
    // HTMLファイルを読み込む
    const htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');
    const dom = new JSDOM(htmlContent);
    const { document } = dom.window;
    
    // 各リソースタイプに対して検証
    for (const [selector, attribute] of Object.entries(RESOURCE_TYPES)) {
      const elements = document.querySelectorAll(selector);
      
      for (const element of elements) {
        const resourcePath = element.getAttribute(attribute);
        
        // 無視するパターンに一致する場合はスキップ
        if (!resourcePath || IGNORE_PATTERNS.some(pattern => pattern.test(resourcePath))) {
          continue;
        }
        
        // 絶対パスをプロジェクトルートからの相対パスに変換
        const absolutePath = path.resolve(
          path.dirname(htmlFilePath),
          resourcePath.startsWith('/') ? resourcePath.substring(1) : resourcePath
        );
        
        // 相対パスをプロジェクトルートからの相対パスに変換
        const relativePath = path.relative(ROOT_DIR, absolutePath);
        
        // ファイルの存在を確認
        if (!fs.existsSync(path.join(ROOT_DIR, relativePath))) {
          errors.push({
            file: path.relative(ROOT_DIR, htmlFilePath),
            resource: resourcePath,
            message: `リソースが見つかりません: ${resourcePath}`,
          });
        }
      }
    }
  } catch (error) {
    errors.push({
      file: path.relative(ROOT_DIR, htmlFilePath),
      resource: null,
      message: `ファイル処理エラー: ${error.message}`,
    });
  }
  
  return errors;
}

/**
 * プロジェクト内のすべてのHTMLファイルを検証する
 */
async function validateAllHtmlFiles() {
  try {
    // HTMLファイルを検索
    const htmlFiles = await glob('**/*.html', {
      cwd: ROOT_DIR,
      ignore: ['node_modules/**', '_site/**', 'vendor/**', '.bundle/**'],
    });
    
    console.log(`${htmlFiles.length}個のHTMLファイルを検証中...`);
    
    let totalErrors = 0;
    
    // 各HTMLファイルを検証
    for (const htmlFile of htmlFiles) {
      const filePath = path.join(ROOT_DIR, htmlFile);
      const errors = await validateHtmlFile(filePath);
      
      if (errors.length > 0) {
        console.log(`\n[${htmlFile}]:`);
        errors.forEach(error => {
          console.log(`  - ${error.message}`);
          totalErrors++;
        });
      }
    }
    
    // 結果を出力
    if (totalErrors > 0) {
      console.log(`\n検証完了: ${totalErrors}個のエラーが見つかりました。`);
      process.exit(1);
    } else {
      console.log(`\n検証完了: すべてのリソースパスが有効です。`);
    }
  } catch (error) {
    console.error(`検証エラー: ${error.message}`);
    process.exit(1);
  }
}

// メイン処理を実行
validateAllHtmlFiles(); 