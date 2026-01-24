// Internationalization Module

const TRANSLATIONS = {
    ja: {
        // TitleScene
        TITLE_JP: 'ねこのズーミーズ',
        TITLE_EN: 'Cat Zoomies',
        TITLE_DESC: '深夜、突然スイッチが入った猫になって\n飼い主が起きる前に家中で大暴れ！',
        BTN_STORY_MODE: 'ストーリーモード',
        BTN_GATHERING: '猫の集会',
        TIP_TOUCH: 'タッチ操作対応',
        TIP_CONTROLS: '← → 移動　　↑/Space ジャンプ　　壁+ジャンプ 壁キック',
        TIP_WALLKICK: '壁に触れながらジャンプで壁キック！',
        DEBUG_RESET: '進捗リセット',

        // PowerUpScene
        POWERUP_SELECT: 'パワーアップを選択',
        POWERUP_STAGE: 'ステージ {0} / 5',
        POWERUP_CURRENT: '現在のパワーアップ:',
        BTN_SKIP: 'スキップ',

        // GameScene (Results)
        RESULT_COMPLETE: 'ミッションコンプリート！',
        RESULT_SCORE: 'スコア:',
        RESULT_TIME_BONUS: 'タイムボーナス:',
        RESULT_SURVIVAL: '生還ボーナス:',
        RESULT_COMBO: 'コンボボーナス:',
        RESULT_ALL_CLEAR: '全ステージクリア！',
        RESULT_ALL_CLEAR_EMOJI: '🎉 全ステージクリア！ 🎉',
        RESULT_BACK_STAGE1: 'ステージ1に戻ります',
        GAMEOVER_FOUND: 'みつかった！',
        GAMEOVER_SCORE: 'スコア:',
        GAMEOVER_MAX_COMBO: '最大コンボ:',
        BTN_NEXT: '次へ',
        BTN_TITLE: 'タイトル',
        BTN_RETRY: 'リトライ',

        // GatheringScene
        GATHERING_TITLE: '猫の集会 - タイムアタック',
        GATHERING_SELECT: '対戦相手を選択',
        GATHERING_TARGET: '目標: {0}秒',
        GATHERING_YOU: 'あなた:',
        GATHERING_VICTORY: '勝利！',
        GATHERING_DEFEAT: '失敗',
        GATHERING_RANK: 'ランク: {0}',
        BTN_AGAIN: 'もういちど',
        BTN_TO_TITLE: 'タイトルへ',

        // HUDScene
        HUD_THUNDER_READY: '⚡ READY',
        HUD_THUNDER_READY_E: '⚡ READY (E)',
        HUD_THUNDER_ACTIVE: '⚡ 残り {0}秒',
        HUD_THUNDER_CD: '⚡ CD {0}秒',

        // Power-Ups
        PU_CATNIP_NAME: 'マタタビ',
        PU_CATNIP_DESC: '移動速度1.5倍！\nでもちょっと滑る…',
        PU_BELL_NAME: '鈴',
        PU_BELL_DESC: 'スコア2倍！\n騒音も2倍！',
        PU_THUNDER_NAME: '雷',
        PU_THUNDER_DESC: '10秒間完全無音！\nクールダウン60秒',
        PU_FULLMOON_NAME: '満月',
        PU_FULLMOON_DESC: 'ジャンプ力UP\n二段ジャンプ解禁！',
        PU_FISH_NAME: '焼き魚',
        PU_FISH_DESC: '破壊で騒音回復！\n少し遅くなる',
        PU_CATTOY_NAME: '猫じゃらし',
        PU_CATTOY_DESC: 'コンボ時間2倍！\n基本スコア10%減',

        // Stage Names
        STAGE_LIVING: 'リビング',
        STAGE_STUDY: '書斎',
        STAGE_KITCHEN: 'キッチン',
        STAGE_JAPANESE: '和室',
        STAGE_ATTIC: '屋根裏部屋',

        // Boss Names
        BOSS_KURO_NAME: 'クロ',
        BOSS_KURO_DESC: '初心者向けの優しい猫\n目標: 22.5秒以内',
        BOSS_SHIRO_NAME: 'シロ',
        BOSS_SHIRO_DESC: '標準的な強さの猫\n目標: 17.5秒以内',
        BOSS_MIKE_NAME: 'ミケ',
        BOSS_MIKE_DESC: '上級者向けの強い猫\n目標: 14秒以内',
        BOSS_BOSS_NAME: 'ボス猫',
        BOSS_BOSS_DESC: '最強の猫、全てを極めた者\n目標: 11秒以内',

        // Gathering Stage Names
        GSTAGE_BEGINNER: '初心者の部屋',
        GSTAGE_STAIRS: '階段の部屋',
        GSTAGE_MAZE: '迷路の部屋',
        GSTAGE_BOSS: 'ボスの城'
    },
    en: {
        // TitleScene
        TITLE_JP: 'ねこのズーミーズ',
        TITLE_EN: 'Cat Zoomies',
        TITLE_DESC: 'Play as a cat with sudden midnight zoomies...\nCause chaos before your owner wakes up!',
        BTN_STORY_MODE: 'Story Mode',
        BTN_GATHERING: 'Cat Gathering',
        TIP_TOUCH: 'Touch Controls',
        TIP_CONTROLS: '← → Move　　↑/Space Jump　　Wall+Jump Wall Kick',
        TIP_WALLKICK: 'Wall kick by jumping while touching a wall!',
        DEBUG_RESET: 'Reset Progress',

        // PowerUpScene
        POWERUP_SELECT: 'Select Power-Up',
        POWERUP_STAGE: 'Stage {0} / 5',
        POWERUP_CURRENT: 'Current Power-Ups:',
        BTN_SKIP: 'Skip',

        // GameScene (Results)
        RESULT_COMPLETE: 'Mission Complete!',
        RESULT_SCORE: 'Score:',
        RESULT_TIME_BONUS: 'Time Bonus:',
        RESULT_SURVIVAL: 'Survival Bonus:',
        RESULT_COMBO: 'Combo Bonus:',
        RESULT_ALL_CLEAR: 'All Stages Clear!',
        RESULT_ALL_CLEAR_EMOJI: '🎉 All Stages Clear! 🎉',
        RESULT_BACK_STAGE1: 'Returning to Stage 1',
        GAMEOVER_FOUND: 'Busted!',
        GAMEOVER_SCORE: 'Score:',
        GAMEOVER_MAX_COMBO: 'Max Combo:',
        BTN_NEXT: 'Next',
        BTN_TITLE: 'Title',
        BTN_RETRY: 'Retry',

        // GatheringScene
        GATHERING_TITLE: 'Cat Gathering - Time Attack',
        GATHERING_SELECT: 'Select Opponent',
        GATHERING_TARGET: 'Target: {0}s',
        GATHERING_YOU: 'You:',
        GATHERING_VICTORY: 'Victory!',
        GATHERING_DEFEAT: 'Defeat',
        GATHERING_RANK: 'Rank: {0}',
        BTN_AGAIN: 'Try Again',
        BTN_TO_TITLE: 'Back to Title',

        // HUDScene
        HUD_THUNDER_READY: '⚡ READY',
        HUD_THUNDER_READY_E: '⚡ READY (E)',
        HUD_THUNDER_ACTIVE: '⚡ {0}s left',
        HUD_THUNDER_CD: '⚡ CD {0}s',

        // Power-Ups
        PU_CATNIP_NAME: 'Catnip',
        PU_CATNIP_DESC: '1.5x speed!\nBut a bit slippery...',
        PU_BELL_NAME: 'Bell',
        PU_BELL_DESC: '2x score!\n2x noise too!',
        PU_THUNDER_NAME: 'Thunder',
        PU_THUNDER_DESC: '10s of silence!\n60s cooldown',
        PU_FULLMOON_NAME: 'Full Moon',
        PU_FULLMOON_DESC: 'Jump power UP\nDouble jump unlocked!',
        PU_FISH_NAME: 'Grilled Fish',
        PU_FISH_DESC: 'Recover noise on break!\nSlightly slower',
        PU_CATTOY_NAME: 'Cat Toy',
        PU_CATTOY_DESC: '2x combo time!\n10% less base score',

        // Stage Names
        STAGE_LIVING: 'Living Room',
        STAGE_STUDY: 'Study',
        STAGE_KITCHEN: 'Kitchen',
        STAGE_JAPANESE: 'Japanese Room',
        STAGE_ATTIC: 'Attic',

        // Boss Names
        BOSS_KURO_NAME: 'Kuro',
        BOSS_KURO_DESC: 'Beginner-friendly cat\nTarget: Under 22.5s',
        BOSS_SHIRO_NAME: 'Shiro',
        BOSS_SHIRO_DESC: 'Standard strength cat\nTarget: Under 17.5s',
        BOSS_MIKE_NAME: 'Calico',
        BOSS_MIKE_DESC: 'Expert-level cat\nTarget: Under 14s',
        BOSS_BOSS_NAME: 'Boss Cat',
        BOSS_BOSS_DESC: 'The ultimate cat\nTarget: Under 11s',

        // Gathering Stage Names
        GSTAGE_BEGINNER: 'Beginner\'s Room',
        GSTAGE_STAIRS: 'Staircase Room',
        GSTAGE_MAZE: 'Maze Room',
        GSTAGE_BOSS: 'Boss Castle'
    }
};

// i18n Manager
const i18n = {
    lang: 'ja', // Default language

    /**
     * Translate a key
     * @param {string} key - Translation key
     * @returns {string} Translated text
     */
    t(key) {
        const translation = TRANSLATIONS[this.lang][key];
        if (translation === undefined) {
            console.warn(`Missing translation for key: ${key} in language: ${this.lang}`);
            return key; // Fallback to key
        }
        return translation;
    },

    /**
     * Set the current language
     * @param {string} lang - Language code ('ja' or 'en')
     */
    setLanguage(lang) {
        if (!TRANSLATIONS[lang]) {
            console.warn(`Unknown language: ${lang}, falling back to 'ja'`);
            lang = 'ja';
        }
        this.lang = lang;
        try {
            localStorage.setItem('cat_zoomies_language', lang);
        } catch (e) {
            console.warn('Unable to save language preference to localStorage:', e.message);
        }
    },

    /**
     * Load language preference from localStorage
     */
    load() {
        try {
            const saved = localStorage.getItem('cat_zoomies_language');
            if (saved && TRANSLATIONS[saved]) {
                this.lang = saved;
            }
        } catch (e) {
            console.warn('Unable to load language preference from localStorage:', e.message);
        }
    }
};

// Load saved language on startup
i18n.load();
