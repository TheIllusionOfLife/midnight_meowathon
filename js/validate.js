// 実行時検証スクリプト - ゲーム起動前にエラーをチェック

function validateGameConfiguration() {
    const errors = [];
    const warnings = [];

    console.log('🔍 Validating game configuration...');

    // 1. Required global variables
    if (typeof POWERUPS === 'undefined') {
        errors.push('POWERUPS is not defined');
    } else {
        const powerUpIds = Object.keys(POWERUPS);
        if (powerUpIds.length !== 6) {
            warnings.push(`Unexpected POWERUPS count: ${powerUpIds.length} (expected: 6)`);
        }

        // Validate each power-up
        Object.entries(POWERUPS).forEach(([id, powerUp]) => {
            if (!powerUp.icon) {
                errors.push(`${id} has no icon set`);
            }
            if (!powerUp.getName || typeof powerUp.getName !== 'function') {
                errors.push(`${id} has no getName() function`);
            }
        });
    }

    if (typeof ITEM_PROPERTIES === 'undefined') {
        errors.push('ITEM_PROPERTIES is not defined (js/items.js required)');
    } else {
        // Validate essential item types exist
        const requiredItems = ['vase', 'book', 'clock'];
        requiredItems.forEach(item => {
            if (!ITEM_PROPERTIES[item]) {
                errors.push(`ITEM_PROPERTIES missing required item: ${item}`);
            } else if (typeof ITEM_PROPERTIES[item].score !== 'number' || typeof ITEM_PROPERTIES[item].noise !== 'number') {
                errors.push(`ITEM_PROPERTIES[${item}] missing or invalid score/noise`);
            }
        });
    }

    if (typeof STAGE_LAYOUTS === 'undefined') {
        errors.push('STAGE_LAYOUTS is not defined');
    } else {
        // Check stages 1-5
        for (let i = 1; i <= 5; i++) {
            if (!STAGE_LAYOUTS[i]) {
                errors.push(`Stage ${i} layout is not defined`);
            } else {
                const layout = STAGE_LAYOUTS[i];
                if (!layout.getName || typeof layout.getName !== 'function') {
                    errors.push(`Stage ${i} has no getName() function`);
                }
                if (!layout.catStart) {
                    errors.push(`Stage ${i} has no cat start position`);
                }
                if (!Array.isArray(layout.platforms)) {
                    errors.push(`Stage ${i} platforms is not an array`);
                }
                if (!Array.isArray(layout.items)) {
                    errors.push(`Stage ${i} items is not an array`);
                }
            }
        }
    }

    if (typeof GATHERING_STAGE_LAYOUTS === 'undefined') {
        errors.push('GATHERING_STAGE_LAYOUTS is not defined');
    } else {
        const requiredBosses = ['kuro', 'shiro', 'mike', 'boss'];
        requiredBosses.forEach(bossId => {
            if (!GATHERING_STAGE_LAYOUTS[bossId]) {
                errors.push(`Boss cat ${bossId} stage is not defined`);
            }
        });
    }

    if (typeof BOSS_CATS === 'undefined') {
        errors.push('BOSS_CATS is not defined');
    } else if (!Array.isArray(BOSS_CATS) || BOSS_CATS.length !== 4) {
        errors.push(`Unexpected BOSS_CATS count: ${BOSS_CATS?.length} (expected: 4)`);
    }

    // 2. Required classes
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
        // Check global scope using globalThis (safer than eval)
        if (typeof globalThis[className] === 'undefined') {
            errors.push(`Class ${className} is not defined`);
        }
    });

    // 3. Global instances
    if (typeof sound === 'undefined') {
        errors.push('sound instance is not defined');
    }
    if (typeof storyProgress === 'undefined') {
        errors.push('storyProgress instance is not defined');
    }
    if (typeof powerUpManager === 'undefined') {
        errors.push('powerUpManager instance is not defined');
    }

    // 4. Required functions
    const requiredFunctions = [
        'createAllTextures',
        'showCatDialogue',
        'wobblyLine'
    ];

    requiredFunctions.forEach(funcName => {
        if (typeof window[funcName] === 'undefined') {
            errors.push(`Function ${funcName} is not defined`);
        }
    });

    // Results
    console.log('\n📊 Validation Results:');
    console.log(`✅ Errors: ${errors.length}`);
    console.log(`⚠️  Warnings: ${warnings.length}`);

    if (errors.length > 0) {
        console.error('\n❌ Error List:');
        errors.forEach((err, i) => console.error(`  ${i + 1}. ${err}`));
    }

    if (warnings.length > 0) {
        console.warn('\n⚠️  Warning List:');
        warnings.forEach((warn, i) => console.warn(`  ${i + 1}. ${warn}`));
    }

    if (errors.length === 0 && warnings.length === 0) {
        console.log('\n✨ All validations passed!');
        return true;
    } else if (errors.length === 0) {
        console.log('\n✅ Validation passed (with warnings)');
        return true;
    } else {
        console.error('\n💥 Validation failed. Cannot start game.');
        return false;
    }
}

// Must be called manually (from index.html)
// Does not use window.addEventListener('load', ...)
