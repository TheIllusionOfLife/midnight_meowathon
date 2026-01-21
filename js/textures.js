// 手書き風テクスチャ生成ヘルパー

const PALETTE = {
    bg: {
        dark: 0x1a1a2e,
        medium: 0x16213e,
        light: 0x0f3460,
        accent: 0x533483
    },
    item: {
        wood: 0x4a4036,
        gold: 0xffd700,
        plant: 0x5fab5f,
        pot: 0xd2691e,
        book: 0x8b3a3a,    // Slightly desaturated red
        paper: 0xfffff0,
        mug: 0xf0f0e0,
        coffee: 0x3e2723
    },
    cat: {
        main: 0xff9f43,    // Soft Orange
        dark: 0xff7f00,    // Shadow
        light: 0xffc070     // Highlight
    },
    light: {
        warm: 0xffeb3b,
        cold: 0x00d2ff
    }
};

// ブレのある線を描画
function wobblyLine(graphics, x1, y1, x2, y2, segments = 8, wobbleAmount = 2) {
    const points = [];
    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const wobble = (Math.random() - 0.5) * wobbleAmount;
        points.push({
            x: x1 + (x2 - x1) * t + wobble,
            y: y1 + (y2 - y1) * t + wobble
        });
    }

    graphics.beginPath();
    graphics.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        graphics.lineTo(points[i].x, points[i].y);
    }
    graphics.strokePath();
}

// テクスチャ感のある塗り（微妙な色違いのドット）
function texturedFill(graphics, x, y, width, height, baseColor, density = 0.1) {
    const r = (baseColor >> 16) & 0xFF;
    const g = (baseColor >> 8) & 0xFF;
    const b = baseColor & 0xFF;

    for (let i = 0; i < width * height * density; i++) {
        const px = x + Math.random() * width;
        const py = y + Math.random() * height;
        const variation = (Math.random() - 0.5) * 30;
        const dotColor = Phaser.Display.Color.GetColor(
            Math.max(0, Math.min(255, r + variation)),
            Math.max(0, Math.min(255, g + variation)),
            Math.max(0, Math.min(255, b + variation))
        );
        graphics.fillStyle(dotColor, 0.3);
        graphics.fillCircle(px, py, 0.5);

    }
}

// ベジエ曲線のヘルパー（Phaser 3 Graphics API互換）
function drawBezier(graphics, x1, y1, cp1x, cp1y, cp2x, cp2y, x2, y2, segments = 20) {
    const curve = new Phaser.Curves.CubicBezier(
        new Phaser.Math.Vector2(x1, y1),
        new Phaser.Math.Vector2(cp1x, cp1y),
        new Phaser.Math.Vector2(cp2x, cp2y),
        new Phaser.Math.Vector2(x2, y2)
    );

    // ポイントを取得して描画
    const points = curve.getPoints(segments);
    for (let i = 0; i < points.length; i++) {
        graphics.lineTo(points[i].x, points[i].y);
    }
}

// テクスチャ生成関数
function createAllTextures(scene) {
    let g;

    // 背景パターン
    g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(PALETTE.bg.medium);
    g.fillRect(0, 0, 64, 64);
    // 抽象的な模様（壁紙風）
    g.lineStyle(2, PALETTE.bg.light, 0.3);
    wobblyLine(g, 0, 16, 64, 16, 4, 1);
    wobblyLine(g, 0, 48, 64, 48, 4, 1);
    g.lineStyle(2, PALETTE.bg.dark, 0.2);
    wobblyLine(g, 16, 0, 16, 64, 4, 1);
    wobblyLine(g, 48, 0, 48, 64, 4, 1);
    g.generateTexture('bg_pattern', 64, 64);
    g.destroy();

    // === 猫の基本形状描画ヘルパー ===
    const drawStandardCat = (g, pose = 'stand') => {
        g.fillStyle(PALETTE.cat.main);

        if (pose === 'wall') {
            // 壁張り付き（縦長）
            g.fillRoundedRect(14, 20, 26, 44, 10); // 縦向き体

            // しっぽ（垂れ下がる）
            g.beginPath();
            g.lineStyle(6, PALETTE.cat.main);
            g.moveTo(27, 60); g.lineTo(27, 74);
            g.strokePath();

            // 足（張り付き）
            g.fillStyle(PALETTE.cat.dark);
            g.fillEllipse(10, 28, 8, 6); // 左手
            g.fillEllipse(44, 28, 8, 6); // 右手
            g.fillEllipse(12, 58, 8, 6); // 左足
            g.fillEllipse(42, 58, 8, 6); // 右足

            // 頭
            g.fillStyle(PALETTE.cat.main);
            g.fillCircle(27, 16, 13);

            // 耳
            g.fillStyle(PALETTE.cat.main);
            g.fillTriangle(18, 4, 12, 14, 22, 12);
            g.fillTriangle(36, 4, 32, 12, 42, 14);
            g.fillStyle(0xffccaa);
            g.fillTriangle(19, 6, 14, 13, 21, 12);
            g.fillTriangle(35, 6, 33, 12, 40, 13);

            // 顔（横向きの時とは座標が違うのでここで描画せず、呼び出し元で描くか、分岐するか）
            // ここではベースのみ
            g.fillStyle(0xffaaaa);
            g.fillTriangle(27, 20, 25, 18, 29, 18);

        } else {
            // 通常（横長）
            g.fillRoundedRect(16, 20, 44, 26, 12);

            // しっぽ
            g.beginPath();
            g.lineStyle(6, PALETTE.cat.main);
            if (pose === 'jump') {
                g.moveTo(16, 30); g.lineTo(4, 20); // 上向き
            } else {
                g.moveTo(16, 30); g.lineTo(6, 26); // 通常
            }
            g.strokePath();

            // 頭
            g.fillStyle(PALETTE.cat.main);
            g.fillCircle(54, 24, 14);

            // 耳
            g.fillStyle(PALETTE.cat.main);
            g.fillTriangle(44, 10, 50, 20, 40, 18); // 左耳
            g.fillTriangle(64, 10, 58, 20, 68, 18); // 右耳
            g.fillStyle(0xffccaa);
            g.fillTriangle(45, 12, 49, 18, 42, 17);
            g.fillTriangle(63, 12, 59, 18, 66, 17);

            // 足
            g.fillStyle(PALETTE.cat.dark);
            if (pose === 'stand' || pose === 'walk1') {
                g.fillEllipse(24, 46, 10, 8); // 後ろ足
                g.fillEllipse(52, 46, 10, 8); // 前足
            } else if (pose === 'walk2') {
                g.fillEllipse(28, 46, 10, 8);
                g.fillEllipse(48, 46, 10, 8);
            } else if (pose === 'jump') {
                g.fillEllipse(20, 50, 10, 8);
                g.fillEllipse(48, 52, 10, 8);
            } else if (pose === 'land') {
                g.fillEllipse(16, 46, 12, 6);
                g.fillEllipse(56, 46, 12, 6);
            }

            // 鼻
            g.fillStyle(0xffaaaa);
            g.fillTriangle(54, 28, 52, 26, 56, 26);

            // ヒゲ
            g.lineStyle(1, 0xffffff, 0.5);
            g.lineBetween(44, 26, 34, 24);
            g.lineBetween(44, 28, 34, 29);
            g.lineBetween(64, 26, 74, 24);
            g.lineBetween(64, 28, 74, 29);
        }
    };

    // 猫（通常）- 統一デザイン
    g = scene.make.graphics({ x: 0, y: 0, add: false });
    drawStandardCat(g, 'stand');
    // 顔（通常）
    g.fillStyle(PALETTE.bg.dark);
    g.fillEllipse(49, 23, 3, 5);
    g.fillEllipse(59, 23, 3, 5);
    g.fillStyle(0xffffff);
    g.fillCircle(50, 22, 1.5);
    g.fillCircle(60, 22, 1.5);
    g.generateTexture('cat', 80, 60);
    g.destroy();

    // ジャンプ - 統一デザイン（微調整）
    g = scene.make.graphics({ x: 0, y: 0, add: false });
    // ジャンプ時は少し体を傾ける
    g.save();
    g.translateCanvas(40, 30);
    g.rotateCanvas(-0.2); // 上向き
    g.translateCanvas(-40, -30);
    drawStandardCat(g, 'jump');
    g.restore();

    // 顔（驚き/真剣）
    g.fillStyle(PALETTE.bg.dark);
    g.fillCircle(49, 23, 3);
    g.fillCircle(59, 23, 3);
    g.fillStyle(0xffffff); // ハイライト
    g.fillCircle(50, 22, 1.5);
    g.fillCircle(60, 22, 1.5);
    g.generateTexture('catJump', 80, 64);
    g.destroy();

    // 歩き1
    g = scene.make.graphics({ x: 0, y: 0, add: false });
    drawStandardCat(g, 'walk1');
    // 顔
    g.fillStyle(PALETTE.bg.dark);
    g.fillEllipse(49, 23, 3, 5);
    g.fillEllipse(59, 23, 3, 5);
    g.fillStyle(0xffffff); // ハイライト
    g.fillCircle(50, 22, 1.5);
    g.fillCircle(60, 22, 1.5);
    g.generateTexture('catWalk1', 80, 60);
    g.destroy();

    // 歩き2
    g = scene.make.graphics({ x: 0, y: 0, add: false });
    drawStandardCat(g, 'walk2'); // 足位置変更
    // 上下動をシミュレート（Y位置ずらし）
    // Texture側でずらすと原点が変わるので、ここでは描画位置を少し下げる
    // 描画ヘルパーを修正してYオフセット対応も可能だが、
    // ここではシンプルにそのまま描画
    // 顔
    g.fillStyle(PALETTE.bg.dark);
    g.fillEllipse(49, 23, 3, 5);
    g.fillEllipse(59, 23, 3, 5);
    g.fillStyle(0xffffff); // ハイライト
    g.fillCircle(50, 22, 1.5);
    g.fillCircle(60, 22, 1.5);
    g.generateTexture('catWalk2', 80, 60);
    g.destroy();

    // 着地
    g = scene.make.graphics({ x: 0, y: 0, add: false });
    // 少し潰す
    g.save();
    g.scaleCanvas(1.1, 0.9);
    drawStandardCat(g, 'land');
    g.restore();
    // 顔（閉じ目）
    g.lineStyle(2, PALETTE.bg.dark);
    g.beginPath();
    g.moveTo(46, 25); g.lineTo(50, 25);
    g.moveTo(58, 25); g.lineTo(62, 25);
    g.strokePath();
    g.generateTexture('catLand', 90, 60);
    g.destroy();

    // 壁
    g = scene.make.graphics({ x: 0, y: 0, add: false });
    drawStandardCat(g, 'wall');
    // 顔
    g.fillStyle(PALETTE.bg.dark);
    g.fillEllipse(22, 15, 3, 5);
    g.fillEllipse(32, 15, 3, 5);
    g.fillStyle(0xffffff); // ハイライト
    g.fillCircle(23, 14, 1.5);
    g.fillCircle(33, 14, 1.5);
    g.generateTexture('catWall', 54, 80); // サイズ拡大
    g.destroy();

    // === 表情差分（基本ポーズを使用） ===

    // 喜び
    g = scene.make.graphics({ x: 0, y: 0, add: false });
    drawStandardCat(g, 'stand');
    // 笑顔
    g.lineStyle(2, PALETTE.bg.dark);
    g.beginPath();
    g.arc(49, 23, 4, 0.2, Math.PI - 0.2);
    g.strokePath();
    g.beginPath();
    g.arc(59, 23, 4, 0.2, Math.PI - 0.2);
    g.strokePath();
    g.fillStyle(0xffffff); // ハイライト（笑顔でも光る）
    // g.fillCircle(50, 20, 1.5); // 笑顔の場合は目が細いのでハイライトは控えめか、なしか
    // 今回は「常に目に光」要望なので入れる
    g.fillCircle(52, 20, 1.5);
    g.fillCircle(62, 20, 1.5);

    g.generateTexture('catHappy', 80, 60);
    g.destroy();

    // 驚き
    g = scene.make.graphics({ x: 0, y: 0, add: false });
    drawStandardCat(g, 'stand');
    // 目
    g.fillStyle(PALETTE.bg.dark);
    g.fillCircle(49, 23, 3.5);
    g.fillCircle(59, 23, 3.5);
    g.fillStyle(0xffffff); // ハイライト
    g.fillCircle(50, 22, 1.5);
    g.fillCircle(60, 22, 1.5);
    // 口
    g.fillCircle(54, 30, 2);
    g.generateTexture('catSurprised', 80, 60);
    g.destroy();

    // 得意げ
    g = scene.make.graphics({ x: 0, y: 0, add: false });
    drawStandardCat(g, 'stand');
    // 目（ニヤリ）
    g.lineStyle(2, PALETTE.bg.dark);
    g.beginPath();
    g.arc(49, 23, 4, 0.8, Math.PI - 0.8);
    g.strokePath();
    g.beginPath();
    g.arc(59, 23, 4, 0.8, Math.PI - 0.8);
    g.strokePath();
    g.fillStyle(0xffffff); // ハイライト
    g.fillCircle(52, 21, 1.5);
    g.fillCircle(62, 21, 1.5);
    g.generateTexture('catSmug', 80, 60);
    g.destroy();

    // 勝利（ジャンプポーズベース）
    g = scene.make.graphics({ x: 0, y: 0, add: false });
    drawStandardCat(g, 'jump');
    // 満面の笑み
    g.lineStyle(2, PALETTE.bg.dark);
    g.beginPath();
    g.arc(49, 23, 4, 0.2, Math.PI - 0.2);
    g.strokePath();
    g.beginPath();
    g.arc(59, 23, 4, 0.2, Math.PI - 0.2);
    g.strokePath();
    g.fillStyle(0xffffff); // ハイライト
    g.fillCircle(52, 21, 1.5);
    g.fillCircle(62, 21, 1.5);
    g.generateTexture('catVictory', 80, 64);
    g.destroy();

    // 以下、既存のアイテムテクスチャ（手書き風に微調整）

    // 花瓶
    g = scene.make.graphics({ x: 0, y: 0, add: false });
    // 本体
    g.fillStyle(0x5bc0de);
    // 本体
    g.fillStyle(0x5bc0de);
    // 上部
    g.fillEllipse(16, 8, 12, 4);
    // 首
    g.fillRect(12, 8, 8, 12);
    // 胴体
    g.fillEllipse(16, 28, 20, 24);
    // 花瓶（改善版）
    g = scene.make.graphics({ x: 0, y: 0, add: false });
    // 本体
    g.fillStyle(PALETTE.item.pot);
    g.fillEllipse(16, 8, 12, 4); // 上
    g.fillRect(12, 8, 8, 12);   // 首
    g.fillEllipse(16, 28, 20, 24); // 胴体
    g.fillEllipse(16, 40, 14, 6);  // 台座

    // ハイライト（Rim Light）
    g.lineStyle(2, 0xffffff, 0.3);
    g.beginPath();
    g.arc(16, 28, 9, Math.PI, Math.PI * 1.5);
    g.strokePath();

    // 花
    g.fillStyle(0xff69b4); // Pink
    g.fillCircle(12, -4, 5);
    g.fillCircle(20, -4, 5);
    g.fillCircle(16, -8, 5);
    g.fillStyle(PALETTE.item.gold);
    g.fillCircle(16, -4, 3);
    g.generateTexture('vase', 32, 60); // サイズ微調整
    g.destroy();

    // 本
    // 本（改善版）
    g = scene.make.graphics({ x: 0, y: 0, add: false });
    // 表紙（下）
    g.fillStyle(PALETTE.item.book);
    g.fillRoundedRect(0, 4, 36, 24, 2);
    // ページ
    g.fillStyle(PALETTE.item.paper);
    g.fillRect(2, 2, 32, 22);
    // 表紙（上）
    g.fillStyle(PALETTE.item.book);
    // 少し明るい色で立体感
    g.fillStyle(Phaser.Display.Color.GetColor(160, 60, 60));
    g.beginPath();
    g.moveTo(0, 4);
    g.lineTo(36, 4);
    g.lineTo(34, 24);
    g.lineTo(2, 24);
    g.closePath();
    g.fillPath();
    // Rim Light
    g.lineStyle(1, 0xffffff, 0.4);
    g.lineBetween(0, 4, 36, 4);

    // タイトル
    g.fillStyle(PALETTE.item.gold);
    g.fillRect(8, 8, 14, 4);
    g.fillRect(8, 14, 20, 2);
    g.generateTexture('book', 36, 30);
    g.destroy();

    // 時計
    // 時計（改善版）
    g = scene.make.graphics({ x: 0, y: 0, add: false });
    // 枠
    g.fillStyle(PALETTE.item.wood);
    g.fillCircle(20, 20, 20);
    // Rim Light
    g.lineStyle(2, 0xffffff, 0.2);
    g.beginPath();
    g.arc(20, 20, 19, -0.5, 3.5);
    g.strokePath();

    g.fillStyle(0xffffff);
    g.fillCircle(20, 20, 16);
    // 文字盤
    g.fillStyle(0x333333);
    for (let i = 0; i < 4; i++) {
        g.fillRect(19, 4, 2, 4); // 12時など
        const rad = i * Math.PI / 2;
        const cx = 20 + Math.sin(rad) * 12;
        const cy = 20 - Math.cos(rad) * 12;
        g.fillCircle(cx, cy, 1.5);
    }
    // 針
    g.lineStyle(2, 0x111111);
    g.lineBetween(20, 20, 20, 10); // 長針
    g.lineStyle(3, 0x111111);
    g.lineBetween(20, 20, 26, 20); // 短針
    g.fillStyle(0xcc4444);
    g.fillCircle(20, 20, 2);
    // 足
    g.lineStyle(2, PALETTE.item.wood);
    g.lineBetween(8, 35, 4, 40);
    g.lineBetween(32, 35, 36, 40);
    // ベル
    g.fillStyle(PALETTE.item.gold);
    g.beginPath();
    g.arc(10, 5, 6, Math.PI, 0);
    g.fillPath();
    g.beginPath();
    g.arc(30, 5, 6, Math.PI, 0);
    g.fillPath();
    g.generateTexture('clock', 40, 42); // 少し縦長
    g.destroy();

    // 植物
    // 植物（改善版）
    g = scene.make.graphics({ x: 0, y: 0, add: false });
    // 鉢
    g.fillStyle(PALETTE.item.pot);
    g.fillPoints([
        { x: 8, y: 34 }, { x: 32, y: 34 },
        { x: 28, y: 60 }, { x: 12, y: 60 }
    ], true);
    // 土
    g.fillStyle(0x3e2723);
    g.fillEllipse(20, 34, 12, 4);

    // 葉
    g.fillStyle(PALETTE.item.plant);
    g.fillEllipse(20, 26, 10, 20);
    g.fillEllipse(10, 30, 12, 16);
    g.fillEllipse(30, 30, 12, 16);
    // ハイライト
    g.fillStyle(0x8fdb8f);
    g.fillEllipse(18, 24, 4, 10);
    g.generateTexture('plant', 40, 64);
    g.destroy();

    // ランプ
    // ランプ（改善版）
    g = scene.make.graphics({ x: 0, y: 0, add: false });
    // シェード
    g.fillStyle(PALETTE.item.paper);
    g.beginPath();
    g.moveTo(10, 30);
    g.lineTo(26, 30);
    g.lineTo(30, 10);
    g.lineTo(6, 10);
    g.closePath();
    g.fillPath();
    // Rim Light (Paper texture)
    g.lineStyle(1, 0xffffff, 0.4);
    g.strokePath();

    // スタンド
    g.fillStyle(PALETTE.item.wood);
    g.fillRect(16, 30, 4, 18);
    // ベース
    g.fillStyle(PALETTE.item.wood);
    g.fillEllipse(18, 50, 16, 6);
    // 光
    g.fillStyle(PALETTE.light.warm, 0.6);
    g.fillTriangle(6, 10, 30, 10, 18, -10);
    g.generateTexture('lamp', 36, 56);
    g.destroy();

    // マグカップ
    // マグカップ
    g = scene.make.graphics({ x: 0, y: 0, add: false });
    // 本体
    g.fillStyle(PALETTE.item.mug);
    g.fillRoundedRect(4, 6, 24, 24, 4);
    // コーヒー
    g.fillStyle(PALETTE.item.coffee);
    g.fillEllipse(16, 8, 20, 6);
    // Rim Light
    g.lineStyle(1, 0xffffff, 0.5);
    g.beginPath();
    g.moveTo(4, 10); g.lineTo(4, 26);
    g.strokePath();

    // 取っ手
    g.lineStyle(4, PALETTE.item.mug);
    g.beginPath();
    g.arc(28, 16, 6, -1.5, 1.5);
    g.strokePath();
    // 湯気
    g.lineStyle(2, 0xffffff, 0.4);
    wobblyLine(g, 12, 4, 12, -4, 2, 1);
    wobblyLine(g, 20, 4, 20, -4, 2, 1);
    g.generateTexture('mug', 40, 40); // サイズ微調整
    g.destroy();

    // 額縁
    g = scene.make.graphics({ x: 0, y: 0, add: false });
    // 枠
    g.fillStyle(0x8b4513);
    g.fillRect(0, 0, 44, 36);
    g.fillStyle(0xffdead);
    g.fillRect(4, 4, 36, 28);
    // 絵（山と太陽）
    g.fillStyle(0x87ceeb); // 空
    g.fillRect(4, 4, 36, 28);
    g.fillStyle(0xff6347); // 太陽
    g.fillCircle(28, 10, 4);
    g.fillStyle(0x2e8b57); // 山
    g.fillTriangle(4, 32, 16, 16, 28, 32);
    g.fillTriangle(20, 32, 32, 20, 40, 32);
    g.generateTexture('frame', 44, 36);
    g.destroy();

    // リモコン
    g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x2f4f4f);
    g.fillRoundedRect(2, 2, 14, 38, 3);
    // 電源ボタン
    g.fillStyle(0xff0000);
    g.fillCircle(9, 8, 2);
    // ボタン群
    g.fillStyle(0xaaaaaa);
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 2; c++) {
            g.fillRect(5 + c * 5, 14 + r * 5, 3, 3);
        }
    }
    g.generateTexture('remote', 18, 42);
    g.destroy();

    // ペン
    g = scene.make.graphics({ x: 0, y: 0, add: false });
    // 軸
    g.fillStyle(0x4169e1);
    g.fillRect(2, 2, 6, 28);
    // クリップ
    g.fillStyle(0xc0c0c0);
    g.fillRect(6, 4, 3, 10);
    // ペン先
    g.fillStyle(0x333333);
    g.fillTriangle(2, 30, 8, 30, 5, 38);
    // ノック部分
    g.fillStyle(0xc0c0c0);
    g.fillRect(3, 0, 4, 2);
    g.generateTexture('pen', 12, 40);
    g.destroy();

    // 月
    g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xffffd8);
    g.fillCircle(30, 30, 28);
    g.fillStyle(0xe8dca0);
    g.fillCircle(20, 22, 6);
    g.fillCircle(38, 38, 8);
    g.fillCircle(42, 18, 4);
    g.generateTexture('moon', 60, 60);
    g.destroy();

    // 星エフェクト
    g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xffffff);
    const cx = 16, cy = 16, spikes = 5, outerR = 14, innerR = 6;
    g.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const angle = (i * Math.PI / spikes) - Math.PI / 2;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        if (i === 0) g.moveTo(x, y);
        else g.lineTo(x, y);
    }
    g.closePath();
    g.fillPath();
    g.generateTexture('star', 32, 32);
    g.destroy();

    // 飼い主の顔（寝ている）
    g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xffddaa);
    g.fillCircle(24, 24, 22);
    g.fillStyle(0x333333);
    g.lineStyle(3, 0x333333);
    g.lineBetween(12, 20, 20, 20);
    g.lineBetween(28, 20, 36, 20);
    g.lineStyle(2, 0xcc8866);
    g.lineBetween(20, 32, 28, 32);
    g.generateTexture('ownerSleep', 48, 48);
    g.destroy();

    // 飼い主の顔（浅い眠り）
    g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xffddaa);
    g.fillCircle(24, 24, 22);
    g.fillStyle(0x333333);
    g.lineStyle(3, 0x333333);
    g.lineBetween(12, 20, 20, 22);
    g.lineBetween(28, 22, 36, 20);
    g.lineStyle(2, 0xcc8866);
    g.beginPath();
    g.arc(24, 30, 6, 0, Math.PI);
    g.strokePath();
    g.generateTexture('ownerLight', 48, 48);
    g.destroy();

    // 飼い主の顔（起きそう）
    g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xffddaa);
    g.fillCircle(24, 24, 22);
    g.fillStyle(0xffffff);
    g.fillEllipse(16, 18, 8, 6);
    g.fillEllipse(32, 18, 8, 6);
    g.fillStyle(0x333333);
    g.fillCircle(16, 19, 2);
    g.fillCircle(32, 19, 2);
    g.lineStyle(2, 0xcc8866);
    g.beginPath();
    g.arc(24, 32, 5, 0.2, Math.PI - 0.2);
    g.strokePath();
    g.lineStyle(2, 0x333333);
    g.lineBetween(10, 12, 18, 15);
    g.lineBetween(38, 12, 30, 15);
    g.generateTexture('ownerStir', 48, 48);
    g.destroy();

    // 飼い主の顔（怒り）
    g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xffccaa);
    g.fillCircle(24, 24, 22);
    g.fillStyle(0xffffff);
    g.fillEllipse(16, 18, 10, 8);
    g.fillEllipse(32, 18, 10, 8);
    g.fillStyle(0x333333);
    g.fillCircle(16, 18, 3);
    g.fillCircle(32, 18, 3);
    g.fillStyle(0xcc4444);
    g.beginPath();
    g.arc(24, 34, 8, 0, Math.PI);
    g.fillPath();
    g.lineStyle(3, 0x333333);
    g.lineBetween(8, 10, 20, 14);
    g.lineBetween(40, 10, 28, 14);
    g.generateTexture('ownerAngry', 48, 48);
    g.destroy();

    // Zzz
    g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xaabbff);
    g.lineStyle(3, 0xaabbff);
    wobblyLine(g, 4, 8, 20, 8, 3, 0.5);
    wobblyLine(g, 20, 8, 4, 24, 3, 0.5);
    wobblyLine(g, 4, 24, 20, 24, 3, 0.5);
    wobblyLine(g, 24, 18, 36, 18, 3, 0.5);
    wobblyLine(g, 36, 18, 24, 30, 3, 0.5);
    wobblyLine(g, 24, 30, 36, 30, 3, 0.5);
    g.generateTexture('zzz', 40, 36);
    g.destroy();

    // 肉球マーク
    g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xffaa88);
    g.fillEllipse(20, 28, 16, 12);
    g.fillCircle(10, 16, 6);
    g.fillCircle(20, 12, 6);
    g.fillCircle(30, 16, 6);
    g.fillCircle(14, 38, 5);
    g.fillCircle(26, 38, 5);
    g.generateTexture('pawprint', 40, 48);
    g.destroy();

    // 紙吹雪/お祝い
    g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xffdd44);
    g.fillTriangle(24, 4, 4, 44, 44, 44);
    g.fillStyle(0xff6644);
    g.fillRect(18, 20, 12, 4);
    g.fillRect(18, 28, 12, 4);
    g.fillRect(18, 36, 12, 4);
    g.fillStyle(0x44ddff);
    g.fillCircle(8, 12, 5);
    g.fillCircle(40, 12, 5);
    g.fillCircle(6, 28, 4);
    g.fillCircle(42, 28, 4);
    g.generateTexture('celebrate', 48, 48);
    g.destroy();

    // ショックマーク
    g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xffff44);
    g.beginPath();
    g.moveTo(24, 0);
    g.lineTo(28, 18);
    g.lineTo(40, 12);
    g.lineTo(30, 26);
    g.lineTo(44, 32);
    g.lineTo(24, 32);
    g.lineTo(28, 48);
    g.lineTo(20, 32);
    g.lineTo(4, 32);
    g.lineTo(18, 26);
    g.lineTo(8, 12);
    g.lineTo(20, 18);
    g.closePath();
    g.fillPath();
    g.generateTexture('shock', 48, 48);
    g.destroy();

    // 再生アイコン
    g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x88ff88);
    g.fillTriangle(12, 6, 12, 34, 38, 20);
    g.generateTexture('iconRetry', 44, 40);
    g.destroy();

    // ホームアイコン
    g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x88aaff);
    g.fillTriangle(20, 4, 4, 20, 36, 20);
    g.fillRect(8, 20, 24, 18);
    g.fillStyle(0x05050a);
    g.fillRect(14, 26, 12, 12);
    g.generateTexture('iconHome', 40, 40);
    g.destroy();

    // 再生ボタン（スタート）
    g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xffffff);
    g.fillTriangle(8, 4, 8, 28, 28, 16);
    g.generateTexture('iconPlay', 32, 32);
    g.destroy();

    // === パワーアップアイコン ===

    // マタタビアイコン（緑の葉）
    g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x44aa44);
    g.fillEllipse(20, 22, 12, 18); // 中央葉
    g.fillStyle(0x33aa33);
    g.fillEllipse(10, 28, 10, 14); // 左葉
    g.fillEllipse(30, 28, 10, 14); // 右葉
    g.fillStyle(0x55bb55);
    g.fillEllipse(20, 18, 6, 10);
    g.lineStyle(3, 0x228822);
    g.lineBetween(20, 32, 20, 44); // 茎
    g.generateTexture('iconCatnip', 40, 48);
    g.destroy();

    // 鈴アイコン（金色の鈴）
    g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xffd700);
    g.fillCircle(20, 24, 16);
    g.fillStyle(0xffec8b);
    g.fillCircle(16, 20, 6);
    g.fillStyle(0xb8860b);
    g.fillCircle(20, 30, 4);
    g.fillRect(16, 4, 8, 10);
    g.fillStyle(0xffd700);
    g.fillEllipse(20, 6, 10, 6);
    g.generateTexture('iconBell', 40, 44);
    g.destroy();

    // 雷アイコン（黄色い稲妻）
    g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xffdd00);
    g.beginPath();
    g.moveTo(24, 0);
    g.lineTo(8, 22);
    g.lineTo(18, 22);
    g.lineTo(14, 44);
    g.lineTo(32, 18);
    g.lineTo(22, 18);
    g.lineTo(28, 0);
    g.closePath();
    g.fillPath();
    g.fillStyle(0xffff88);
    g.fillTriangle(20, 8, 16, 18, 24, 16);
    g.generateTexture('iconThunder', 40, 48);
    g.destroy();

    // 満月アイコン（クリーム色の月）
    g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xffffd8);
    g.fillCircle(20, 20, 18);
    g.fillStyle(0xe8dca0);
    g.fillCircle(14, 16, 5);
    g.fillCircle(26, 26, 6);
    g.fillCircle(28, 12, 3);
    g.generateTexture('iconMoon', 40, 40);
    g.destroy();

    // 焼き魚アイコン（青い魚）
    g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x4488cc);
    g.fillEllipse(22, 20, 20, 12); // 体
    g.fillTriangle(40, 20, 48, 10, 48, 30); // 尾
    g.fillStyle(0x66aadd);
    g.fillEllipse(18, 18, 14, 8);
    g.fillStyle(0x3377bb);
    g.fillTriangle(22, 10, 18, 20, 26, 18); // 背びれ
    g.fillStyle(0xffffff);
    g.fillCircle(10, 18, 4);
    g.fillStyle(0x222222);
    g.fillCircle(10, 18, 2);
    g.generateTexture('iconFish', 52, 40);
    g.destroy();

    // 猫じゃらしアイコン（渦巻き）
    g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.lineStyle(5, 0x6666cc);
    g.beginPath();
    g.arc(20, 20, 14, 0, Math.PI * 1.5);
    g.strokePath();
    g.lineStyle(4, 0x8888dd);
    g.beginPath();
    g.arc(20, 20, 9, Math.PI * 0.5, Math.PI * 2);
    g.strokePath();
    g.lineStyle(3, 0xaaaaee);
    g.beginPath();
    g.arc(20, 20, 4, Math.PI, Math.PI * 2.5);
    g.strokePath();
    g.fillStyle(0xccccff);
    g.fillCircle(20, 20, 3);
    g.generateTexture('iconCatToy', 40, 40);
    g.destroy();

    // === ベッド ===
    g = scene.make.graphics({ x: 0, y: 0, add: false });
    // ベッドフレーム
    g.fillStyle(0x5a4030);
    g.fillRoundedRect(0, 0, 100, 60, 4);
    // マットレス
    g.fillStyle(0xeeddcc);
    g.fillRoundedRect(4, 4, 92, 52, 4);
    // 枕
    g.fillStyle(0xffffff);
    g.fillRoundedRect(8, 8, 30, 20, 6);
    // 布団
    g.fillStyle(0x6688aa);
    g.fillRoundedRect(42, 6, 54, 48, 4);
    // 布団の模様
    g.fillStyle(0x7799bb);
    g.fillRect(50, 14, 40, 4);
    g.fillRect(50, 26, 40, 4);
    g.fillRect(50, 38, 40, 4);
    g.generateTexture('bed', 100, 60);
    g.destroy();

    // === 新UI: 飼い主モニター ===

    // モニター枠
    g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x222233);
    g.fillRoundedRect(0, 0, 100, 100, 12);
    g.lineStyle(4, 0x444455);
    g.strokeRoundedRect(2, 2, 96, 96, 10);
    g.generateTexture('ui_monitor_frame', 100, 100);
    g.destroy();

    // 飼い主の顔（共通ヘルパー）
    const drawOwnerFace = (g, state) => {
        // 顔のベース
        g.fillStyle(0xffdbac); // 肌色
        g.fillCircle(40, 40, 32);

        // 髪
        g.fillStyle(0x5a4030); // 茶髪
        g.beginPath();
        g.arc(40, 38, 35, Math.PI, 0); // 頭頂部
        g.lineTo(75, 65); // 右もみあげ
        g.lineTo(65, 65);
        g.lineTo(65, 32); // 右前髪
        g.quadraticBezierTo(40, 28, 15, 32); // 前髪カーブ
        g.lineTo(15, 65); // 左前髪
        g.lineTo(5, 65); // 左もみあげ
        g.closePath();
        g.fillPath();

        // 表情
        if (state === 'sleep') {
            // 寝顔
            g.lineStyle(3, 0x554433);
            g.beginPath();
            g.arc(28, 42, 6, 0.8, 2.3); // 左目（閉じ）
            g.strokePath();
            g.beginPath();
            g.arc(52, 42, 6, 0.8, 2.3); // 右目（閉じ）
            g.strokePath();

            // 口（すやすや）
            g.lineStyle(2, 0xcc8888);
            g.fillCircle(40, 56, 3);

            // 鼻提灯（アニメ用）
            // g.fillStyle(0xaaccff, 0.5);
            // g.fillCircle(48, 52, 8);
        } else if (state === 'wake') {
            // 起きかけ（不機嫌）
            g.fillStyle(0xffffff);
            g.fillEllipse(28, 40, 10, 6); // 左白目
            g.fillEllipse(52, 40, 10, 6); // 右白目

            g.fillStyle(0x332211);
            g.fillCircle(28, 40, 2); // 左黒目（小さい）
            g.fillCircle(52, 40, 2); // 右黒目

            // 眉（ひそめ）
            g.lineStyle(3, 0x554433);
            g.lineBetween(20, 32, 34, 36);
            g.lineBetween(60, 32, 46, 36);

            // 口（への字）
            g.beginPath();
            g.arc(40, 58, 6, Math.PI + 0.5, -0.5);
            g.strokePath();

            // 漫符（イライラ）
            g.lineStyle(2, 0xff0000);
            g.lineBetween(60, 20, 70, 10);
            g.lineBetween(65, 25, 75, 15);
        } else if (state === 'angry') {
            // 激怒
            g.fillStyle(0xffffff);
            g.fillCircle(28, 40, 8); // 左白目（カッ）
            g.fillCircle(52, 40, 8); // 右白目

            g.fillStyle(0xff0000); // 充血
            g.fillCircle(28, 40, 3);
            g.fillCircle(52, 40, 3);

            // 眉（激怒）
            g.lineStyle(4, 0x000000);
            g.lineBetween(18, 30, 36, 42);
            g.lineBetween(62, 30, 44, 42);

            // 口（咆哮）
            g.fillStyle(0x660000);
            g.fillEllipse(40, 60, 12, 16);
            g.fillStyle(0xffffff); // 歯
            g.fillTriangle(34, 54, 46, 54, 40, 64);

            // 背景効果（赤）
            // g.lineStyle(2, 0xff0000);
            // wobblyLine(g, 10, 10, 70, 70, 5, 2);
        }
    };

    // 睡眠（通常）
    g = scene.make.graphics({ x: 0, y: 0, add: false });
    drawOwnerFace(g, 'sleep');
    g.generateTexture('ui_owner_sleep', 80, 80);
    g.destroy();

    // 起きかけ（黄色ゾーン）
    g = scene.make.graphics({ x: 0, y: 0, add: false });
    drawOwnerFace(g, 'wake');
    g.generateTexture('ui_owner_wake', 80, 80);
    g.destroy();

    // 激怒（赤ゾーン）
    g = scene.make.graphics({ x: 0, y: 0, add: false });
    drawOwnerFace(g, 'angry');
    g.generateTexture('ui_owner_angry', 80, 80);
    g.destroy();

    // ノイズゲージ（円形）
    // 実際にはGameScene側でGraphicsを使って動的に描画するか、
    // ここでベースを作ってマスクするか。
    // 今回は「スピーカーアイコン」等の装飾をここで作る
    g = scene.make.graphics({ x: 0, y: 0, add: false });
    // スピーカー
    g.fillStyle(0xcccccc);
    g.fillRect(10, 20, 10, 20);
    g.beginPath();
    g.moveTo(20, 20); g.lineTo(40, 10); g.lineTo(40, 50); g.lineTo(20, 40);
    g.closePath();
    g.fillPath();
    // 音波
    g.lineStyle(3, 0xffffff);
    g.beginPath(); g.arc(40, 30, 10, -0.5, 0.5); g.strokePath();
    g.beginPath(); g.arc(40, 30, 16, -0.5, 0.5); g.strokePath();

    g.generateTexture('iconSpeaker', 60, 60);
    g.destroy();
}
