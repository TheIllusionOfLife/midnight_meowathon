// ステージレイアウト定義

const STAGE_LAYOUTS = {
    1: { // リビング（現在の基本ステージ）
        getName: () => i18n.t('STAGE_LIVING'),
        background: { color1: 0x12121f, color2: 0x1a1a2a },
        catStart: { x: 650, y: 380 },
        platforms: [
            // 本棚
            { x: 130, y: 205, w: 95, h: 12, color: 0x6a5545 },
            { x: 130, y: 280, w: 95, h: 12, color: 0x6a5545 },
            { x: 130, y: 355, w: 95, h: 12, color: 0x6a5545 },
            { x: 130, y: 400, w: 100, h: 15, color: 0x5a4535 },
            // テーブル
            { x: 360, y: 420, w: 155, h: 12, color: 0x7b6354 },
            // ソファ
            { x: 540, y: 432, w: 95, h: 10, color: 0x8a6050, bouncy: true },
            // TV台
            { x: 700, y: 430, w: 75, h: 10, color: 0x5a5a6a }
        ],
        items: [
            { x: 110, y: 180, type: 'vase', scale: 0.7 },
            { x: 150, y: 180, type: 'book', scale: 1.0 },
            { x: 115, y: 255, type: 'frame', scale: 0.75 },
            { x: 150, y: 330, type: 'plant', scale: 0.6 },
            { x: 320, y: 395, type: 'mug', scale: 0.8 },
            { x: 370, y: 395, type: 'book', scale: 0.9 },
            { x: 410, y: 395, type: 'remote', scale: 1.2 },
            { x: 700, y: 405, type: 'lamp', scale: 0.55 }
        ]
    },
    2: { // 書斎
        getName: () => i18n.t('STAGE_STUDY'),
        background: { color1: 0x0f1520, color2: 0x1a2030 },
        catStart: { x: 400, y: 450 },
        platforms: [
            // 大きな本棚（左）
            { x: 100, y: 450, w: 80, h: 10, color: 0x6a5545 },
            { x: 100, y: 380, w: 80, h: 10, color: 0x6a5545 },
            { x: 100, y: 310, w: 80, h: 10, color: 0x6a5545 },
            { x: 100, y: 240, w: 80, h: 10, color: 0x6a5545 },
            { x: 100, y: 170, w: 80, h: 10, color: 0x6a5545 },
            // 机
            { x: 350, y: 420, w: 120, h: 12, color: 0x7b6354 },
            // 本棚（右）
            { x: 700, y: 450, w: 80, h: 10, color: 0x6a5545 },
            { x: 700, y: 380, w: 80, h: 10, color: 0x6a5545 },
            { x: 700, y: 310, w: 80, h: 10, color: 0x6a5545 },
            { x: 700, y: 240, w: 80, h: 10, color: 0x6a5545 },
            // 吊り棚
            { x: 400, y: 200, w: 100, h: 10, color: 0x6a5545 }
        ],
        items: [
            { x: 80, y: 425, type: 'book', scale: 1.0 },
            { x: 120, y: 425, type: 'pen', scale: 1.0 },
            { x: 80, y: 355, type: 'book', scale: 0.9 },
            { x: 120, y: 355, type: 'frame', scale: 0.7 },
            { x: 80, y: 285, type: 'vase', scale: 0.7 },
            { x: 120, y: 285, type: 'clock', scale: 0.7 },
            { x: 80, y: 215, type: 'book', scale: 1.0 },
            { x: 120, y: 215, type: 'pen', scale: 1.0 },
            { x: 80, y: 145, type: 'plant', scale: 0.6 },
            { x: 330, y: 395, type: 'lamp', scale: 0.6 },
            { x: 370, y: 395, type: 'mug', scale: 0.8 },
            { x: 680, y: 425, type: 'book', scale: 1.0 },
            { x: 720, y: 425, type: 'remote', scale: 1.0 },
            { x: 680, y: 355, type: 'book', scale: 0.9 },
            { x: 720, y: 355, type: 'pen', scale: 1.0 },
            { x: 680, y: 285, type: 'vase', scale: 0.7 },
            { x: 380, y: 175, type: 'clock', scale: 0.7 },
            { x: 420, y: 175, type: 'frame', scale: 0.7 }
        ]
    },
    3: { // キッチン - ドミノエフェクト
        getName: () => i18n.t('STAGE_KITCHEN'),
        background: { color1: 0x1a1510, color2: 0x252015 },
        catStart: { x: 100, y: 450 },
        timeLimit: 70, // Reduced from 80
        platforms: [
            // カウンター（左）- narrower
            { x: 130, y: 420, w: 80, h: 12, color: 0x8a8a8a },
            // カウンター（中左）- new platform
            { x: 260, y: 410, w: 60, h: 12, color: 0x8a8a8a },
            // カウンター（右）- bigger gap, narrower
            { x: 380, y: 420, w: 70, h: 12, color: 0x8a8a8a },
            // 吊り戸棚（左）- narrower
            { x: 110, y: 250, w: 75, h: 10, color: 0x7a7a7a },
            { x: 110, y: 180, w: 75, h: 10, color: 0x7a7a7a },
            { x: 110, y: 110, w: 75, h: 10, color: 0x7a7a7a }, // New top shelf
            // 中央の棚 - narrower
            { x: 500, y: 370, w: 60, h: 10, color: 0x8a8a8a },
            { x: 500, y: 280, w: 60, h: 10, color: 0x8a8a8a },
            { x: 500, y: 190, w: 60, h: 10, color: 0x8a8a8a }, // New level
            // 冷蔵庫の上（バウンシー）- higher and narrower
            { x: 660, y: 270, w: 70, h: 12, color: 0x9a9a9a, bouncy: true },
            // 吊り戸棚（右）- narrower, more levels
            { x: 690, y: 200, w: 75, h: 10, color: 0x7a7a7a },
            { x: 690, y: 130, w: 75, h: 10, color: 0x7a7a7a }
        ],
        items: [
            // カウンター（左）- more stacks
            { x: 110, y: 395, type: 'mug', scale: 0.8, stackGroup: 'stack1' },
            { x: 110, y: 375, type: 'book', scale: 0.9, stackGroup: 'stack1' },
            { x: 110, y: 355, type: 'pen', scale: 1.0, stackGroup: 'stack1' }, // 3-stack
            { x: 150, y: 395, type: 'vase', scale: 0.7 },
            // カウンター（中左）- rolling cans
            { x: 260, y: 385, type: 'canFood', scale: 0.8 },
            // カウンター（右）- more rolling
            { x: 370, y: 395, type: 'canFood', scale: 0.8 },
            { x: 410, y: 395, type: 'remote', scale: 1.0 },
            // 吊り戸棚（左）- stacks on all levels
            { x: 100, y: 225, type: 'plant', scale: 0.6, stackGroup: 'stack2' },
            { x: 100, y: 205, type: 'mug', scale: 0.8, stackGroup: 'stack2' },
            { x: 135, y: 225, type: 'frame', scale: 0.7 },
            { x: 100, y: 155, type: 'clock', scale: 0.7, stackGroup: 'stack3' },
            { x: 100, y: 135, type: 'lamp', scale: 0.6, stackGroup: 'stack3' },
            { x: 135, y: 155, type: 'book', scale: 0.9 },
            { x: 100, y: 85, type: 'vase', scale: 0.7 },
            { x: 135, y: 85, type: 'pen', scale: 1.0 },
            // 中央の棚 - all levels
            { x: 490, y: 345, type: 'vase', scale: 0.7 },
            { x: 490, y: 255, type: 'plant', scale: 0.6, stackGroup: 'stack4' },
            { x: 490, y: 235, type: 'mug', scale: 0.8, stackGroup: 'stack4' },
            { x: 490, y: 165, type: 'clock', scale: 0.7 },
            // 冷蔵庫の上
            { x: 650, y: 245, type: 'book', scale: 1.0 },
            { x: 670, y: 245, type: 'lamp', scale: 0.6 },
            // 吊り戸棚（右）
            { x: 680, y: 175, type: 'remote', scale: 1.0 },
            { x: 700, y: 175, type: 'pen', scale: 1.0 },
            { x: 680, y: 105, type: 'vase', scale: 0.7 },
            { x: 700, y: 105, type: 'frame', scale: 0.7 }
        ]
    },
    4: { // 和室 - 禅チャレンジ
        getName: () => i18n.t('STAGE_JAPANESE'),
        background: { color1: 0x1a1510, color2: 0x201a10 },
        catStart: { x: 400, y: 450 },
        timeLimit: 75, // Reduced from 90
        platforms: [
            // 座卓（こたつトラップ）- narrower, centered
            { x: 250, y: 440, w: 110, h: 10, color: 0x6a5040, comfy: true },
            // 座卓（右）- another comfy trap!
            { x: 500, y: 435, w: 90, h: 10, color: 0x6a5040, comfy: true },
            // 床の間の棚 - narrower, 4 levels
            { x: 670, y: 400, w: 90, h: 10, color: 0x6a5040 },
            { x: 670, y: 320, w: 90, h: 10, color: 0x6a5040 },
            { x: 670, y: 240, w: 90, h: 10, color: 0x6a5040 },
            { x: 670, y: 160, w: 90, h: 10, color: 0x6a5040 },
            // 押入れの上 - narrower, 3 levels
            { x: 95, y: 350, w: 75, h: 12, color: 0x7a6050 },
            { x: 95, y: 260, w: 75, h: 12, color: 0x7a6050 },
            { x: 95, y: 170, w: 75, h: 12, color: 0x7a6050 },
            // 中央の足場 - narrow platforms requiring precision
            { x: 320, y: 330, w: 60, h: 10, color: 0x6a5040 },
            { x: 420, y: 280, w: 60, h: 10, color: 0x6a5040 },
            // 鴨居 - narrower
            { x: 400, y: 130, w: 160, h: 10, color: 0x6a5040 }
        ],
        softZones: [
            // 畳エリア（騒音50%減）- smaller
            { x: 380, y: 480, w: 200, h: 40 }
        ],
        hazards: [
            // 風鈴（入口エリア）
            { x: 100, y: 400, type: 'windChime' }
        ],
        items: [
            // 座卓（左）
            { x: 235, y: 415, type: 'mug', scale: 0.8 },
            { x: 265, y: 415, type: 'book', scale: 1.0 },
            // 座卓（右）
            { x: 490, y: 410, type: 'vase', scale: 0.7 },
            { x: 510, y: 410, type: 'pen', scale: 1.0 },
            // 床の間の棚（高得点アイテム）- all 4 levels, stacked
            { x: 660, y: 375, type: 'vase', scale: 0.7, stackGroup: 'stack1' },
            { x: 660, y: 355, type: 'plant', scale: 0.6, stackGroup: 'stack1' },
            { x: 690, y: 375, type: 'lamp', scale: 0.6 },
            { x: 660, y: 295, type: 'clock', scale: 0.7, stackGroup: 'stack2' },
            { x: 660, y: 275, type: 'frame', scale: 0.7, stackGroup: 'stack2' },
            { x: 690, y: 295, type: 'mug', scale: 0.8 },
            { x: 660, y: 215, type: 'book', scale: 0.9 },
            { x: 690, y: 215, type: 'remote', scale: 1.0 },
            { x: 660, y: 135, type: 'vase', scale: 0.7 },
            { x: 690, y: 135, type: 'clock', scale: 0.7 },
            // 押入れの上 - all 3 levels
            { x: 85, y: 325, type: 'remote', scale: 1.0 },
            { x: 105, y: 325, type: 'pen', scale: 1.0 },
            { x: 85, y: 235, type: 'book', scale: 0.9 },
            { x: 105, y: 235, type: 'mug', scale: 0.8 },
            { x: 85, y: 145, type: 'lamp', scale: 0.6 },
            { x: 105, y: 145, type: 'frame', scale: 0.7 },
            // 中央の足場
            { x: 320, y: 305, type: 'plant', scale: 0.6 },
            { x: 420, y: 255, type: 'vase', scale: 0.7 },
            // 鴨居
            { x: 385, y: 105, type: 'pen', scale: 1.0 },
            { x: 415, y: 105, type: 'remote', scale: 1.0 }
        ]
    },
    5: { // 屋根裏部屋 - 重力ガントレット
        getName: () => i18n.t('STAGE_ATTIC'),
        background: { color1: 0x0a0a10, color2: 0x15151a },
        catStart: { x: 100, y: 450 },
        timeLimit: 65, // Reduced from 75
        platforms: [
            // 斜めの梁（左）- steeper, narrower, more crumbling
            { x: 150, y: 410, w: 75, h: 10, color: 0x5a4030 },
            { x: 210, y: 340, w: 70, h: 10, color: 0x5a4030, crumbling: true },
            { x: 270, y: 260, w: 70, h: 10, color: 0x5a4030, crumbling: true },
            { x: 320, y: 180, w: 65, h: 10, color: 0x5a4030, crumbling: true },
            // 中央の足場 - all crumbling except bottom
            { x: 400, y: 370, w: 65, h: 10, color: 0x6a5040 },
            { x: 400, y: 290, w: 60, h: 10, color: 0x6a5040, crumbling: true },
            { x: 400, y: 210, w: 60, h: 10, color: 0x6a5040, crumbling: true },
            { x: 400, y: 130, w: 55, h: 10, color: 0x6a5040, crumbling: true },
            // 斜めの梁（右）- steeper, narrower, more crumbling
            { x: 480, y: 180, w: 65, h: 10, color: 0x5a4030, crumbling: true },
            { x: 530, y: 260, w: 70, h: 10, color: 0x5a4030, crumbling: true },
            { x: 590, y: 340, w: 70, h: 10, color: 0x5a4030, crumbling: true },
            { x: 650, y: 410, w: 75, h: 10, color: 0x5a4030 },
            // Floating platforms - require precise crumble-chain timing
            { x: 250, y: 150, w: 50, h: 8, color: 0x6a5040 },
            { x: 550, y: 150, w: 50, h: 8, color: 0x6a5040 },
            // Top center - ultimate challenge
            { x: 400, y: 90, w: 80, h: 10, color: 0x6a5040 }
        ],
        moonbeam: {
            startX: 100,
            endX: 700,
            y: 0,
            width: 80,
            cycleTime: 30000
        },
        slowZones: [
            // 蜘蛛の巣エリア（左上隅）
            { x: 50, y: 180, w: 80, h: 120 },
            // 蜘蛛の巣エリア（右上隅）
            { x: 670, y: 180, w: 80, h: 120 }
        ],
        items: [
            // 左下（梁1）
            { x: 140, y: 385, type: 'book', scale: 1.0 },
            { x: 160, y: 385, type: 'pen', scale: 1.0 },
            // 左2（クランブル - 危険！）
            { x: 200, y: 315, type: 'vase', scale: 0.7 },
            { x: 220, y: 315, type: 'remote', scale: 1.0 },
            // 左3（クランブル - さらに危険！）
            { x: 260, y: 235, type: 'clock', scale: 0.7, stackGroup: 'stack1' },
            { x: 260, y: 215, type: 'lamp', scale: 0.6, stackGroup: 'stack1' },
            { x: 280, y: 235, type: 'mug', scale: 0.8 },
            // 左4（クランブル - 蜘蛛の巣）
            { x: 315, y: 155, type: 'vase', scale: 0.7 },
            { x: 325, y: 155, type: 'plant', scale: 0.6 },
            // 中央1
            { x: 390, y: 345, type: 'frame', scale: 0.7 },
            { x: 410, y: 345, type: 'mug', scale: 0.8 },
            // 中央2（クランブル）
            { x: 395, y: 265, type: 'plant', scale: 0.6, stackGroup: 'stack2' },
            { x: 395, y: 245, type: 'vase', scale: 0.7, stackGroup: 'stack2' },
            // 中央3（クランブル）
            { x: 395, y: 185, type: 'clock', scale: 0.7 },
            { x: 405, y: 185, type: 'lamp', scale: 0.6 },
            // 中央4（クランブル - 最も危険）
            { x: 395, y: 105, type: 'vase', scale: 0.7 },
            { x: 405, y: 105, type: 'frame', scale: 0.7 },
            // 右4（クランブル - 蜘蛛の巣）
            { x: 475, y: 155, type: 'clock', scale: 0.7 },
            { x: 485, y: 155, type: 'plant', scale: 0.6 },
            // 右3（クランブル）
            { x: 520, y: 235, type: 'lamp', scale: 0.6, stackGroup: 'stack3' },
            { x: 520, y: 215, type: 'mug', scale: 0.8, stackGroup: 'stack3' },
            { x: 540, y: 235, type: 'vase', scale: 0.7 },
            // 右2（クランブル）
            { x: 580, y: 315, type: 'book', scale: 0.9 },
            { x: 600, y: 315, type: 'pen', scale: 1.0 },
            // 右下（梁）
            { x: 640, y: 385, type: 'mug', scale: 0.8 },
            { x: 660, y: 385, type: 'remote', scale: 1.0 },
            // フローティング左（蜘蛛の巣内）
            { x: 250, y: 125, type: 'clock', scale: 0.7 },
            // フローティング右（蜘蛛の巣内）
            { x: 550, y: 125, type: 'vase', scale: 0.7 },
            // 最上部（究極の挑戦）
            { x: 390, y: 65, type: 'vase', scale: 0.7 },
            { x: 410, y: 65, type: 'clock', scale: 0.7 }
        ]
    }
};
