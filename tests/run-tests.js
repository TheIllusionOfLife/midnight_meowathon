#!/usr/bin/env node

// Node.js ベースのテストランナー - ブラウザ不要

console.log('🧪 Cat Zoomies - テスト実行中...\n');

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

test('GameScene が固定ワールドサイズの物理境界を設定している', () => {
    const content = fs.readFileSync('js/scenes/GameScene.js', 'utf8');
    assert(
        content.includes('physics.world.setBounds') ||
        content.includes('physics.world.setBounds('),
        'GameScene に physics.world.setBounds がありません'
    );
    assert(
        content.includes('WORLD_WIDTH') && content.includes('WORLD_HEIGHT'),
        'GameScene が固定ワールドサイズ定数を使用していません'
    );
});

test('結果画面が GameLayout のレスポンシブ値を使用している', () => {
    const content = fs.readFileSync('js/scenes/GameScene.js', 'utf8');
    const start = content.indexOf('showResultScreen');
    assert(start !== -1, 'showResultScreen が見つかりません');
    const snippet = content.slice(start, start + 1200);
    assert(snippet.includes('GameLayout.'), 'showResultScreen が GameLayout を使用していません');
});

test('結果画面表示時に HUDScene の入力を停止している', () => {
    const content = fs.readFileSync('js/scenes/GameScene.js', 'utf8');
    const start = content.indexOf('showResultScreen');
    assert(start !== -1, 'showResultScreen が見つかりません');
    const snippet = content.slice(start, start + 800);
    assert(
        snippet.includes("stop('HUDScene')") || snippet.includes('stop("HUDScene")'),
        'showResultScreen で HUDScene を停止していません'
    );
});

test('ゲームオーバー時の不快なサウンドを停止している', () => {
    const content = fs.readFileSync('js/scenes/GameScene.js', 'utf8');
    assert(!content.includes('sound.hiss()'), 'sound.hiss が残っています');
});

test('モバイルで雷を発動できる UI がある', () => {
    const content = fs.readFileSync('js/scenes/HUDScene.js', 'utf8');
    assert(
        content.includes('createThunderButton') ||
        content.includes('thunderBtn'),
        'HUDScene に雷ボタンがありません'
    );
});

test('結果画面がカメラ座標変換を使用している', () => {
    const content = fs.readFileSync('js/scenes/GameScene.js', 'utf8');
    const start = content.indexOf('showResultScreen');
    assert(start !== -1, 'showResultScreen が見つかりません');
    const snippet = content.slice(start, start + 1200);
    assert(
        snippet.includes('getWorldPoint'),
        'showResultScreen が getWorldPoint を使用していません'
    );
});

test('雷の状態表示が HUDScene にある', () => {
    const content = fs.readFileSync('js/scenes/HUDScene.js', 'utf8');
    assert(
        content.includes('thunderLabel') || content.includes('Thunder'),
        'HUDScene に雷の状態表示がありません'
    );
});

test('タイトル画面に壁キックのヒントがある', () => {
    const content = fs.readFileSync('js/scenes/TitleScene.js', 'utf8');
    assert(
        content.includes('壁キック') || content.includes('壁ジャンプ') || content.includes('TIP_WALLKICK'),
        'タイトル画面に壁キックのヒントがありません'
    );
});

test('猫のセリフに不適切な語が含まれていない', () => {
    const content = fs.readFileSync('js/effects.js', 'utf8');
    assert(!content.includes('ふんっ'), '猫のセリフに「ふんっ」が残っています');
});

test('ゲームオーバー時に不快なサウンドを再生しない', () => {
    const gameScene = fs.readFileSync('js/scenes/GameScene.js', 'utf8');
    const gatheringScene = fs.readFileSync('js/scenes/GatheringScene.js', 'utf8');
    assert(!gameScene.includes('sound.gameOver()'), 'GameScene に sound.gameOver が残っています');
    assert(!gatheringScene.includes('sound.gameOver()'), 'GatheringScene に sound.gameOver が残っています');
});

test('タイトルの日本語表記が更新されている', () => {
    const titleScene = fs.readFileSync('js/scenes/TitleScene.js', 'utf8');
    const indexHtml = fs.readFileSync('index.html', 'utf8');
    assert(!titleScene.includes('よるのうんどうかい'), 'TitleScene に旧タイトルが残っています');
    assert(!indexHtml.includes('よるのうんどうかい'), 'index.html に旧タイトルが残っています');
});

test('タイトル画面の月が縦画面で重複しない', () => {
    const content = fs.readFileSync('js/scenes/TitleScene.js', 'utf8');
    assert(
        content.includes('GameLayout.isPortrait') && content.includes('moon'),
        'TitleScene に縦画面の月分岐がありません'
    );
});

test('モバイル操作がゲームモード間で共有されている', () => {
    const mobile = fs.readFileSync('js/mobile.js', 'utf8');
    const gathering = fs.readFileSync('js/scenes/GatheringScene.js', 'utf8');
    const hud = fs.readFileSync('js/scenes/HUDScene.js', 'utf8');
    assert(mobile.includes('createMobileControls'), 'mobile.js に共通モバイル制御関数がありません');
    assert(gathering.includes('createMobileControls'), 'GatheringScene が共通モバイル制御を使っていません');
    assert(hud.includes('createMobileControls'), 'HUDScene が共通モバイル制御を使っていません');
});

test('アイテム破壊音が快適な効果音に置き換わっている', () => {
    const gameScene = fs.readFileSync('js/scenes/GameScene.js', 'utf8');
    const gatheringScene = fs.readFileSync('js/scenes/GatheringScene.js', 'utf8');
    assert(gameScene.includes('sound.itemBreak'), 'GameScene が itemBreak サウンドを使用していません');
    assert(gatheringScene.includes('sound.itemBreak'), 'GatheringScene が itemBreak サウンドを使用していません');
    assert(!gameScene.includes('sound.hit('), 'GameScene に sound.hit が残っています');
    assert(!gatheringScene.includes('sound.hit('), 'GatheringScene に sound.hit が残っています');
});

test('月明かりがウィンドウ座標に同期している', () => {
    const content = fs.readFileSync('js/scenes/GameScene.js', 'utf8');
    const start = content.indexOf('createAtmosphere() {');
    assert(start !== -1, 'createAtmosphere() { が見つかりません');
    const snippet = content.slice(start, start + 800);
    assert(snippet.includes('this.windowX'), 'createAtmosphere が windowX を使用していません');
    assert(snippet.includes('this.windowY'), 'createAtmosphere が windowY を使用していません');
});

test('猫の集会の移動入力がジョイスティック方向に基づいている', () => {
    const content = fs.readFileSync('js/scenes/GatheringScene.js', 'utf8');
    assert(content.includes('getDirection()'), 'GatheringScene が getDirection を使用していません');
    assert(!content.includes('joystick.left'), 'GatheringScene に joystick.left が残っています');
    assert(!content.includes('joystick.right'), 'GatheringScene に joystick.right が残っています');
});

test('モバイル操作が破棄後のリサイズで落ちない', () => {
    const content = fs.readFileSync('js/mobile.js', 'utf8');
    assert(content.includes('this.destroyed'), 'mobile.js に破棄フラグがありません');
    assert(content.includes('this.base.geom'), 'VirtualJoystick の geom ガードがありません');
    assert(content.includes('this.button.geom'), 'JumpButton の geom ガードがありません');
});

test('猫の集会のリサイズがゲーム画面を中央に保つ', () => {
    const content = fs.readFileSync('js/scenes/GatheringScene.js', 'utf8');
    assert(content.includes('centerOn'), 'GatheringScene が centerOn を使用していません');
    assert(content.includes('removeBounds'), 'GatheringScene が removeBounds を使用していません');
});

test('猫の集会のモバイル操作がカメラ座標で配置されている', () => {
    const content = fs.readFileSync('js/scenes/GatheringScene.js', 'utf8');
    assert(content.includes('updateMobileControlsForCamera'), 'GatheringScene が updateMobileControlsForCamera を使用していません');
    assert(!content.includes('updateMobileControlsForScreen'), 'GatheringScene に updateMobileControlsForScreen が残っています');
});

test('猫の集会のズームが1以上に拡大されない', () => {
    const content = fs.readFileSync('js/scenes/GatheringScene.js', 'utf8');
    assert(
        content.includes('Math.min(zoomX, zoomY, 1)') ||
        content.includes('Math.min(1, zoomX, zoomY)') ||
        content.includes('Math.min(1, zoomY, zoomX)'),
        'GatheringScene がズーム上限を設定していません'
    );
});

test('猫の集会のモバイル横画面にズーム余白がある', () => {
    const content = fs.readFileSync('js/scenes/GatheringScene.js', 'utf8');
    assert(
        content.includes('zoomPadding') ||
        content.includes('* 0.92') ||
        content.includes('* 0.9'),
        'GatheringScene にモバイル横画面のズーム余白がありません'
    );
});

test('猫の集会のモバイル横画面で下側に余白を確保している', () => {
    const content = fs.readFileSync('js/scenes/GatheringScene.js', 'utf8');
    assert(
        content.includes('visibleH') ||
        content.includes('minCenterY') ||
        content.includes('centerYOffset') ||
        (content.includes('centerY') && content.includes('centerOn')),
        'GatheringScene に縦方向の余白調整がありません'
    );
});

test('猫の集会の初期位置が床に合わせている', () => {
    const content = fs.readFileSync('js/scenes/GatheringScene.js', 'utf8');
    const start = content.indexOf('createCat()');
    assert(start !== -1, 'GatheringScene に createCat がありません');
    const snippet = content.slice(start, start + 500);
    assert(snippet.includes('platforms'), 'createCat が platforms を参照していません');
});

test('猫の集会のゲーム開始時にカメラ調整が行われる', () => {
    const content = fs.readFileSync('js/scenes/GatheringScene.js', 'utf8');
    assert(content.includes('initTimeAttack'), 'GatheringScene に initTimeAttack がありません');
    assert(content.includes('handleResize'), 'initTimeAttack で handleResize が呼ばれていません');
});

test('猫の集会が固定ワールド境界を設定している', () => {
    const content = fs.readFileSync('js/scenes/GatheringScene.js', 'utf8');
    assert(
        content.includes('physics.world.setBounds') ||
        content.includes('physics.world.setBounds('),
        'GatheringScene に physics.world.setBounds がありません'
    );
});

test('猫の集会のジョイスティック位置がUIの安全領域に合わせられている', () => {
    const content = fs.readFileSync('js/scenes/GatheringScene.js', 'utf8');
    assert(
        content.includes('controlsLeft') && content.includes('controlsRight'),
        'GatheringScene が GameLayout.controlsLeft/Right を使用していません'
    );
});

test('画面座標用モバイル操作がズーム補正を行う', () => {
    const mobile = fs.readFileSync('js/mobile.js', 'utf8');
    assert(mobile.includes('updateMobileControlsForScreen'), 'updateMobileControlsForScreen がありません');
    assert(
        mobile.includes('inputScale = zoom') ||
        mobile.includes('1 / zoom') ||
        mobile.includes('/ zoom'),
        'updateMobileControlsForScreen がズーム補正を行っていません'
    );
});

test('猫の集会のモバイル操作を再生成する前にクリーンアップしている', () => {
    const content = fs.readFileSync('js/scenes/GatheringScene.js', 'utf8');
    const match = content.match(/createUI\(\)\s*\{/);
    assert(match && typeof match.index === 'number', 'GatheringScene に createUI がありません');
    const start = match.index;
    const snippet = content.slice(start, start + 600);
    assert(
        snippet.includes('cleanupMobileControls') || snippet.includes('destroy()'),
        'createUI で既存モバイル操作のクリーンアップがありません'
    );
});

test('猫の集会の遷移時にモバイル操作をクリーンアップしている', () => {
    const content = fs.readFileSync('js/scenes/GatheringScene.js', 'utf8');
    assert(content.includes('cleanupMobileControls'), 'cleanupMobileControls がありません');
    assert(
        content.includes('shutdown()') && content.includes('cleanupMobileControls'),
        'shutdown で cleanupMobileControls が呼ばれていません'
    );
});

test('ジョイスティックがワールド座標入力に対応している', () => {
    const mobile = fs.readFileSync('js/mobile.js', 'utf8');
    assert(
        mobile.includes('pointer.worldX') || mobile.includes('pointer.worldY'),
        'VirtualJoystick が worldX/worldY を参照していません'
    );
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
