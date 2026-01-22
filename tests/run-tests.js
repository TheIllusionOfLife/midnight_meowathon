#!/usr/bin/env node

// Node.js ベースのテストランナー - ブラウザ不要

console.log('🧪 Midnight Meowathon - テスト実行中...\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function test(name, fn) {
    totalTests++;
    try {
        fn();
        console.log(`✅ ${name}`);
        passedTests++;
    } catch (error) {
        console.error(`❌ ${name}`);
        console.error(`   ${error.message}`);
        failedTests++;
    }
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
}

function assertEqual(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(message || `Expected ${expected}, got ${actual}`);
    }
}

// ファイルの存在確認
const fs = require('fs');
const path = require('path');

console.log('📁 ファイル構造の検証\n');

test('index.html が存在する', () => {
    assert(fs.existsSync('index.html'), 'index.html が見つかりません');
});

test('test.html が存在する', () => {
    assert(fs.existsSync('test.html'), 'test.html が見つかりません');
});

const requiredJsFiles = [
    'js/responsive.js',
    'js/sound.js',
    'js/textures.js',
    'js/effects.js',
    'js/mobile.js',
    'js/roguelite.js',
    'js/gathering.js',
    'js/items.js',
    'js/stages.js',
    'js/validate.js',
    'js/scenes/TitleScene.js',
    'js/scenes/PowerUpScene.js',
    'js/scenes/GameScene.js',
    'js/scenes/GatheringScene.js',
    'js/scenes/HUDScene.js'
];

requiredJsFiles.forEach(file => {
    test(`${file} が存在する`, () => {
        assert(fs.existsSync(file), `${file} が見つかりません`);
    });
});

console.log('\n📊 JavaScriptファイルの構文チェック\n');

// 簡易的な構文チェック（括弧の対応のみ）
requiredJsFiles.forEach(file => {
    test(`${file} の構文チェック`, () => {
        const content = fs.readFileSync(file, 'utf8');

        // 基本的な括弧の対応チェック
        const openBraces = (content.match(/{/g) || []).length;
        const closeBraces = (content.match(/}/g) || []).length;
        if (openBraces !== closeBraces) {
            throw new Error(`括弧の数が一致しません: { ${openBraces}, } ${closeBraces}`);
        }

        const openParens = (content.match(/\(/g) || []).length;
        const closeParens = (content.match(/\)/g) || []).length;
        if (openParens !== closeParens) {
            throw new Error(`丸括弧の数が一致しません: ( ${openParens}, ) ${closeParens}`);
        }
    });
});

console.log('\n🔍 設定ファイルの検証\n');

test('stages.js に STAGE_LAYOUTS が定義されている', () => {
    const content = fs.readFileSync('js/stages.js', 'utf8');
    assert(content.includes('const STAGE_LAYOUTS'), 'STAGE_LAYOUTS が定義されていません');
    assert(content.includes('1:'), 'ステージ1が定義されていません');
    assert(content.includes('5:'), 'ステージ5が定義されていません');
});

test('gathering.js に GATHERING_STAGE_LAYOUTS が定義されている', () => {
    const content = fs.readFileSync('js/gathering.js', 'utf8');
    assert(content.includes('const GATHERING_STAGE_LAYOUTS'), 'GATHERING_STAGE_LAYOUTS が定義されていません');
    assert(!content.includes('const STAGE_LAYOUTS'), 'STAGE_LAYOUTS との名前衝突があります');
    assert(content.includes('kuro:'), 'kuroステージが定義されていません');
    assert(content.includes('boss:'), 'bossステージが定義されていません');
});

test('roguelite.js にパワーアップが定義されている', () => {
    const content = fs.readFileSync('js/roguelite.js', 'utf8');
    assert(content.includes('const POWERUPS'), 'POWERUPS が定義されていません');
    assert(content.includes('catnip:'), 'catnip が定義されていません');
    assert(content.includes('iconCatnip'), 'アイコンが画像名に更新されていません');
    assert(!content.includes('🌿'), '絵文字が残っています');
});

test('items.js に ITEM_PROPERTIES が定義されている', () => {
    const content = fs.readFileSync('js/items.js', 'utf8');
    assert(content.includes('const ITEM_PROPERTIES'), 'ITEM_PROPERTIES が定義されていません');
    assert(content.includes('vase:'), 'vase が定義されていません');
    assert(content.includes('score:'), 'score プロパティが定義されていません');
    assert(content.includes('noise:'), 'noise プロパティが定義されていません');
});

test('index.html のスクリプト読み込み順序が正しい', () => {
    const content = fs.readFileSync('index.html', 'utf8');
    const scripts = content.match(/<script src="([^"]+)"><\/script>/g) || [];
    const scriptOrder = scripts.map(s => s.match(/src="([^"]+)"/)[1]);

    // validate.js がシーンファイルより後に読み込まれているか
    const validateIndex = scriptOrder.indexOf('js/validate.js');
    const titleSceneIndex = scriptOrder.indexOf('js/scenes/TitleScene.js');

    assert(validateIndex > titleSceneIndex, 'validate.js がシーンファイルより前に読み込まれています');
});

test('textures.js にアイコンテクスチャが定義されている', () => {
    const content = fs.readFileSync('js/textures.js', 'utf8');
    const requiredIcons = ['iconCatnip', 'iconBell', 'iconThunder', 'iconMoon', 'iconFish', 'iconCatToy'];

    requiredIcons.forEach(icon => {
        assert(content.includes(`'${icon}'`), `${icon} テクスチャが定義されていません`);
    });

    assert(content.includes("'bed'"), 'bed テクスチャが定義されていません');
});



console.log('\n🏃 ランタイムテストの実行\n');

test('textures.js のランタイム実行テスト (Graphics API検証)', () => {
    try {
        require('child_process').execSync('node tests/test-textures-runtime.js', { stdio: 'inherit' });
    } catch (e) {
        throw new Error('ランタイムテストが失敗しました');
    }
});

console.log('\n📈 結果サマリー\n');
console.log(`総テスト数: ${totalTests}`);
console.log(`✅ 合格: ${passedTests}`);
console.log(`❌ 失敗: ${failedTests}`);
console.log(`成功率: ${Math.round((passedTests / totalTests) * 100)}%\n`);

if (failedTests === 0) {
    console.log('🎉 すべてのテストに合格しました！\n');
    process.exit(0);
} else {
    console.log('💥 一部のテストが失敗しました。\n');
    process.exit(1);
}
