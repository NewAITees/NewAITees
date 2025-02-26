/**
 * 多言語対応機能を管理するクラス
 * @class I18nManager
 */
class I18nManager {
    constructor() {
        this.translations = {}; // 翻訳データを保持
        this.currentLang = 'ja'; // デフォルト言語
        this.dataAttr = 'data-i18n'; // i18n用データ属性
    }

    /**
     * 言語リソースファイルを読み込む
     * @param {string} lang - 言語コード（'ja', 'en'など）
     * @returns {Promise<boolean>} - 読み込み成功時はtrue、失敗時はfalse
     */
    async loadLanguage(lang) {
        try {
            const response = await fetch(`i18n/${lang}.json`);
            if (!response.ok) {
                throw new Error(`Failed to load language file: ${lang}.json`);
            }
            this.translations[lang] = await response.json();
            return true;
        } catch (error) {
            console.error('Error loading language:', error);
            return false;
        }
    }

    /**
     * 言語を設定し、ページのテキストを更新する
     * @param {string} lang - 設定する言語コード
     * @returns {Promise<boolean>} - 設定成功時はtrue、失敗時はfalse
     */
    async setLanguage(lang) {
        // すでに言語ファイルが読み込まれているか確認
        if (!this.translations[lang]) {
            const success = await this.loadLanguage(lang);
            if (!success) return false;
        }
        
        this.currentLang = lang;
        this.updatePageText();
        this.updateLangButtons();
        this.saveLanguagePreference(lang);
        
        // HTML lang属性も更新
        document.documentElement.lang = lang;
        
        return true;
    }

    /**
     * ページ内のテキストを現在の言語設定に合わせて更新する
     */
    updatePageText() {
        const elements = document.querySelectorAll(`[${this.dataAttr}]`);
        
        elements.forEach(element => {
            const key = element.getAttribute(this.dataAttr);
            const text = this.getTranslation(key);
            
            if (text !== undefined) {
                // input要素の場合は値として設定
                if (element.tagName === 'INPUT' && element.type === 'text') {
                    element.value = text;
                    return;
                }
                
                // ボタンやプレースホルダーの場合
                if (element.hasAttribute('placeholder')) {
                    element.setAttribute('placeholder', text);
                    return;
                }
                
                // 通常のテキストコンテンツの場合
                element.textContent = text;
            }
        });
    }

    /**
     * 翻訳キーから対応するテキストを取得する（ネストされたキー対応）
     * @param {string} key - ドット区切りの翻訳キー（例: 'nav.gallery'）
     * @returns {string|undefined} - 翻訳テキスト、キーが存在しない場合はundefined
     */
    getTranslation(key) {
        const keys = key.split('.');
        let value = this.translations[this.currentLang];
        
        for (const k of keys) {
            if (value === undefined || value[k] === undefined) {
                console.warn(`Translation key not found: ${key}`);
                return undefined;
            }
            value = value[k];
        }
        
        return value;
    }

    /**
     * 言語切り替えボタンの状態を現在の言語設定に合わせて更新する
     */
    updateLangButtons() {
        const buttons = document.querySelectorAll('.lang-btn');
        buttons.forEach(button => {
            if (button.getAttribute('data-lang') === this.currentLang) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }

    /**
     * 言語設定をlocalStorageに保存する
     * @param {string} lang - 保存する言語コード
     */
    saveLanguagePreference(lang) {
        try {
            localStorage.setItem('language', lang);
        } catch (e) {
            console.warn('Could not save language preference:', e);
        }
    }

    /**
     * localStorageから言語設定を読み込む
     * @returns {string|null} - 保存されている言語コード、未設定の場合はnull
     */
    loadLanguagePreference() {
        try {
            return localStorage.getItem('language');
        } catch (e) {
            console.warn('Could not load language preference:', e);
            return null;
        }
    }

    /**
     * ブラウザの言語設定を検出する
     * @returns {string} - 検出された言語コード（'ja'または'en'）
     */
    detectBrowserLanguage() {
        const lang = navigator.language || navigator.userLanguage;
        // 'ja'か'ja-JP'などならja、それ以外はenに設定
        return lang.startsWith('ja') ? 'ja' : 'en';
    }
}

// DOMが読み込まれたら実行
document.addEventListener('DOMContentLoaded', async () => {
    // 多言語マネージャの初期化
    const i18n = new I18nManager();
    
    // 言語設定の初期化順序:
    // 1. ローカルストレージの設定
    // 2. ブラウザの言語設定
    // 3. デフォルト言語(ja)
    const savedLang = i18n.loadLanguagePreference();
    const browserLang = i18n.detectBrowserLanguage();
    const initialLang = savedLang || browserLang;
    
    // 初期言語を設定
    await i18n.setLanguage(initialLang);
    
    // 言語切り替えボタンのイベント設定
    const langButtons = document.querySelectorAll('.lang-btn');
    langButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const lang = button.getAttribute('data-lang');
            await i18n.setLanguage(lang);
        });
    });
    
    // デバッグ用にグローバル変数として公開
    window.i18n = i18n;
}); 