// 実行時検証スクリプト - ゲーム起動前にエラーをチェック

function validateGameConfiguration() {
    const errors = [];
    const warnings = [];

    console.log('🔍 ゲーム設定を検証中...');

    // 1. 必須グローバル変数の存在確認
    if (typeof POWERUPS === 'undefined') {
        errors.push('POWERUPS が定義されていません');
    } else {
        const powerUpIds = Object.keys(POWERUPS);
        if (powerUpIds.length !== 6) {
            warnings.push(`POWERUPS の数が異常です: ${powerUpIds.length} (期待値: 6)`);
        }

        // 各パワーアップの検証
        Object.entries(POWERUPS).forEach(([id, powerUp]) => {
            if (!powerUp.icon) {
                errors.push(`${id} にアイコンが設定されていません`);
            }
            if (!powerUp.name) {
                errors.push(`${id} に名前が設定されていません`);
            }
        });
    }

    if (typeof STAGE_LAYOUTS === 'undefined') {
        errors.push('STAGE_LAYOUTS が定義されていません');
    } else {
        // ステージ1-5の存在確認
        for (let i = 1; i <= 5; i++) {
            if (!STAGE_LAYOUTS[i]) {
                errors.push(`ステージ${i}のレイアウトが定義されていません`);
            } else {
                const layout = STAGE_LAYOUTS[i];
                if (!layout.name) {
                    errors.push(`ステージ${i}に名前がありません`);
                }
                if (!layout.catStart) {
                    errors.push(`ステージ${i}に猫の開始位置がありません`);
                }
                if (!Array.isArray(layout.platforms)) {
                    errors.push(`ステージ${i}のプラットフォームが配列ではありません`);
                }
                if (!Array.isArray(layout.items)) {
                    errors.push(`ステージ${i}のアイテムが配列ではありません`);
                }
            }
        }
    }

    if (typeof GATHERING_STAGE_LAYOUTS === 'undefined') {
        errors.push('GATHERING_STAGE_LAYOUTS が定義されていません');
    } else {
        const requiredBosses = ['kuro', 'shiro', 'mike', 'boss'];
        requiredBosses.forEach(bossId => {
            if (!GATHERING_STAGE_LAYOUTS[bossId]) {
                errors.push(`ボス猫 ${bossId} のステージが定義されていません`);
            }
        });
    }

    if (typeof BOSS_CATS === 'undefined') {
        errors.push('BOSS_CATS が定義されていません');
    } else if (!Array.isArray(BOSS_CATS) || BOSS_CATS.length !== 4) {
        errors.push(`BOSS_CATS の数が異常です: ${BOSS_CATS?.length} (期待値: 4)`);
    }

    // 2. クラスの存在確認
    const requiredClasses = [
        'PowerUpManager',
        'StoryProgress',
        'TimeAttackRules',
        'SoundEngine',
        'TitleScene',
        'PowerUpScene',
        'GameScene',
        'GatheringScene'
    ];

    requiredClasses.forEach(className => {
        if (typeof window[className] === 'undefined') {
            errors.push(`クラス ${className} が定義されていません`);
        }
    });

    // 3. グローバルインスタンスの確認
    if (typeof sound === 'undefined') {
        errors.push('sound インスタンスが定義されていません');
    }
    if (typeof storyProgress === 'undefined') {
        errors.push('storyProgress インスタンスが定義されていません');
    }
    if (typeof powerUpManager === 'undefined') {
        errors.push('powerUpManager インスタンスが定義されていません');
    }

    // 4. 関数の存在確認
    const requiredFunctions = [
        'createAllTextures',
        'showCatDialogue',
        'wobblyLine'
    ];

    requiredFunctions.forEach(funcName => {
        if (typeof window[funcName] === 'undefined') {
            errors.push(`関数 ${funcName} が定義されていません`);
        }
    });

    // 結果表示
    console.log('\n📊 検証結果:');
    console.log(`✅ エラー: ${errors.length}件`);
    console.log(`⚠️  警告: ${warnings.length}件`);

    if (errors.length > 0) {
        console.error('\n❌ エラー一覧:');
        errors.forEach((err, i) => console.error(`  ${i + 1}. ${err}`));
    }

    if (warnings.length > 0) {
        console.warn('\n⚠️  警告一覧:');
        warnings.forEach((warn, i) => console.warn(`  ${i + 1}. ${warn}`));
    }

    if (errors.length === 0 && warnings.length === 0) {
        console.log('\n✨ すべての検証に合格しました！');
        return true;
    } else if (errors.length === 0) {
        console.log('\n✅ 検証に合格しました（警告あり）');
        return true;
    } else {
        console.error('\n💥 検証に失敗しました。ゲームを起動できません。');
        return false;
    }
}

// 手動で呼び出す必要があります（index.htmlから）
// window.addEventListener('load', ...) は使用しません
