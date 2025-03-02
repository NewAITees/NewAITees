# NewAITees テスト環境

このディレクトリにはNewAITeesウェブサイトのテスト環境が含まれています。
各テストは特定の問題を検出するために設計されており、デプロイ前の品質確認に役立ちます。

## テスト構成

テスト環境は以下の構成になっています：

```
tests/
├── e2e/            # ブラウザを使用したエンドツーエンドテスト
├── unit/           # 個別のJavaScriptファイルのユニットテスト
└── utils/          # テスト用ユーティリティ（パス検証など）
```

## 必要条件

テストを実行するには以下のソフトウェアが必要です：

- Node.js (v14以上)
- npm または yarn

## セットアップ

1. パッケージをインストールします：

```bash
npm install
```

2. テストを実行します：

```bash
# すべてのテストを実行
npm test

# 特定のテストのみ実行
npm test -- -t 'ギャラリーページが正しく表示される'

# 特定のファイルのテストのみ実行
npm test -- tests/unit/gallery.test.js

# 監視モードでテストを実行（ファイル変更時に自動実行）
npm run test:watch
```

## パス検証ユーティリティ

HTMLファイル内のリソースパス（CSS、JS、画像ファイルなど）を検証するユーティリティが含まれています。
これにより、存在しないファイルへの参照による404エラーを事前に検出できます。

```bash
# パス検証ユーティリティを実行
npm run test:path
```

## ユニットテスト

JavaScriptの各機能を単体でテストします。

- `gallery.test.js`: ギャラリー表示機能とフィルター機能をテスト
- `home-gallery.test.js`: ホームページのギャラリー機能をテスト

## E2Eテスト

実際のブラウザでウェブサイトを表示し、表示や動作を検証します。

- `browser.test.js`: Puppeteerを使用したブラウザテスト

E2Eテストでは以下の項目を検証します：

1. ページが正しく表示されるか
2. 画像やリソースが正しく読み込まれるか
3. 404エラーが発生していないか
4. パス参照に問題がないか（重複した`assets/assets`などのパスがないか）

## ESLintを使用したコード品質の確認

コードの品質をチェックするために、ESLintが設定されています。

```bash
# ESLintでコードを検証
npm run lint
```

## よくある問題と解決策

### 1. 画像パスの問題

画像が表示されない場合、以下の点を確認してください：

- パスが正しいか（`./assets/images/`ではなく`./images/`など）
- 重複した`assets/assets`のようなパスがないか
- 存在しないディレクトリ（`thumbs`など）を参照していないか

### 2. E2Eテストの失敗

E2Eテストが失敗する場合、以下を確認してください：

- HTTPサーバーが起動しているか
- 必要な依存関係がインストールされているか
- `error-report.json`ファイルでエラーの詳細を確認する

## CI/CD統合

このテスト環境はGitHub ActionsなどのCI/CDパイプラインに統合できます。
以下はGitHub Actionsの設定例です：

```yaml
name: Tests

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Use Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
    - name: Install dependencies
      run: npm ci
    - name: Lint code
      run: npm run lint
    - name: Run unit tests
      run: npm test
    - name: Validate paths
      run: npm run test:path
```

## 参考資料

- [Jest ドキュメント](https://jestjs.io/ja/docs/getting-started)
- [Puppeteer ドキュメント](https://pptr.dev/)
- [ESLint ドキュメント](https://eslint.org/docs/user-guide/getting-started) 