const { TextEncoder, TextDecoder } = require('util');

// グローバルなTextEncoderとTextDecoderをセットアップ
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// 詳細なログ記録のための設定
const originalLog = console.log;
const originalError = console.error;

// ログレベルを設定（'debug', 'info', 'warn', 'error'）
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// ログレベルの優先順位
const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

// ログ関数をオーバーライド
console.log = function(...args) {
  if (LOG_LEVELS[LOG_LEVEL] <= LOG_LEVELS.info) {
    originalLog.apply(console, args);
  }
};

console.debug = function(...args) {
  if (LOG_LEVELS[LOG_LEVEL] <= LOG_LEVELS.debug) {
    originalLog.apply(console, ['[DEBUG]', ...args]);
  }
};

console.error = function(...args) {
  if (LOG_LEVELS[LOG_LEVEL] <= LOG_LEVELS.error) {
    originalError.apply(console, args);
  }
};

// グレースフルなプロセス終了のためのハンドラ
let isShuttingDown = false;

// プロセス終了前の処理（クリーンアップなど）
const cleanup = () => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  
  console.log('テストプロセスが終了中です...');
  // ここに必要なクリーンアップコードを追加
  
  // すべてのタイマーをクリア
  const timers = setTimeout(() => {}, 0);
  for (let i = 0; i < timers; i++) {
    clearTimeout(i);
  }
  
  console.log('クリーンアップが完了しました');
};

// 異常終了のハンドラ
process.on('uncaughtException', (error) => {
  console.error('キャッチされていない例外:', error);
  cleanup();
  process.exit(1);
});

// 未処理のプロミスリジェクション
process.on('unhandledRejection', (reason, promise) => {
  console.error('未処理のプロミスリジェクション:', reason);
  cleanup();
});

// 正常終了シグナル
process.on('SIGTERM', () => {
  console.log('SIGTERMを受信しました');
  cleanup();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINTを受信しました');
  cleanup();
  process.exit(0);
}); 