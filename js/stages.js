// ステージレイアウト定義

const STAGE_LAYOUTS = {
    1: { // リビング（現在の基本ステージ）
        name: 'リビング',
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
        name: '書斎',
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
    3: { // キッチン
        name: 'キッチン',
        background: { color1: 0x1a1510, color2: 0x252015 },
        catStart: { x: 100, y: 450 },
        platforms: [
            // カウンター
            { x: 150, y: 420, w: 120, h: 12, color: 0x8a8a8a },
            // 吊り戸棚（左）
            { x: 120, y: 250, w: 100, h: 10, color: 0x7a7a7a },
            { x: 120, y: 180, w: 100, h: 10, color: 0x7a7a7a },
            // 中央の棚
            { x: 400, y: 350, w: 80, h: 10, color: 0x8a8a8a },
            { x: 400, y: 250, w: 80, h: 10, color: 0x8a8a8a },
            // 冷蔵庫の上
            { x: 650, y: 300, w: 80, h: 12, color: 0x9a9a9a },
            // 吊り戸棚（右）
            { x: 680, y: 180, w: 100, h: 10, color: 0x7a7a7a }
        ],
        items: [
            { x: 130, y: 395, type: 'mug', scale: 0.8 },
            { x: 170, y: 395, type: 'vase', scale: 0.7 },
            { x: 100, y: 225, type: 'plant', scale: 0.6 },
            { x: 140, y: 225, type: 'mug', scale: 0.8 },
            { x: 100, y: 155, type: 'clock', scale: 0.7 },
            { x: 140, y: 155, type: 'frame', scale: 0.7 },
            { x: 380, y: 325, type: 'vase', scale: 0.7 },
            { x: 420, y: 325, type: 'plant', scale: 0.6 },
            { x: 380, y: 225, type: 'lamp', scale: 0.6 },
            { x: 420, y: 225, type: 'mug', scale: 0.8 },
            { x: 630, y: 275, type: 'book', scale: 1.0 },
            { x: 670, y: 275, type: 'remote', scale: 1.0 },
            { x: 660, y: 155, type: 'clock', scale: 0.7 },
            { x: 700, y: 155, type: 'vase', scale: 0.7 }
        ]
    },
    4: { // 和室
        name: '和室',
        background: { color1: 0x1a1510, color2: 0x201a10 },
        catStart: { x: 400, y: 450 },
        platforms: [
            // 座卓
            { x: 250, y: 440, w: 140, h: 10, color: 0x6a5040 },
            // 床の間の棚
            { x: 650, y: 380, w: 120, h: 10, color: 0x6a5040 },
            { x: 650, y: 280, w: 120, h: 10, color: 0x6a5040 },
            // 押入れの上
            { x: 100, y: 300, w: 100, h: 12, color: 0x7a6050 },
            // 鴨居
            { x: 400, y: 200, w: 200, h: 10, color: 0x6a5040 }
        ],
        items: [
            { x: 230, y: 415, type: 'mug', scale: 0.8 },
            { x: 270, y: 415, type: 'book', scale: 1.0 },
            { x: 630, y: 355, type: 'vase', scale: 0.7 },
            { x: 670, y: 355, type: 'plant', scale: 0.6 },
            { x: 630, y: 255, type: 'clock', scale: 0.7 },
            { x: 670, y: 255, type: 'frame', scale: 0.7 },
            { x: 80, y: 275, type: 'lamp', scale: 0.6 },
            { x: 120, y: 275, type: 'remote', scale: 1.0 },
            { x: 380, y: 175, type: 'pen', scale: 1.0 },
            { x: 420, y: 175, type: 'book', scale: 0.9 }
        ]
    },
    5: { // 屋根裏部屋
        name: '屋根裏部屋',
        background: { color1: 0x0a0a10, color2: 0x15151a },
        catStart: { x: 100, y: 450 },
        platforms: [
            // 斜めの梁（左）
            { x: 150, y: 400, w: 100, h: 10, color: 0x5a4030 },
            { x: 200, y: 320, w: 100, h: 10, color: 0x5a4030 },
            { x: 250, y: 240, w: 100, h: 10, color: 0x5a4030 },
            // 中央の足場
            { x: 400, y: 350, w: 80, h: 10, color: 0x6a5040 },
            { x: 400, y: 250, w: 80, h: 10, color: 0x6a5040 },
            // 斜めの梁（右）
            { x: 550, y: 240, w: 100, h: 10, color: 0x5a4030 },
            { x: 600, y: 320, w: 100, h: 10, color: 0x5a4030 },
            { x: 650, y: 400, w: 100, h: 10, color: 0x5a4030 },
            // 天井近くの棚
            { x: 400, y: 150, w: 120, h: 10, color: 0x6a5040 }
        ],
        items: [
            { x: 130, y: 375, type: 'book', scale: 1.0 },
            { x: 170, y: 375, type: 'pen', scale: 1.0 },
            { x: 180, y: 295, type: 'vase', scale: 0.7 },
            { x: 220, y: 295, type: 'remote', scale: 1.0 },
            { x: 230, y: 215, type: 'lamp', scale: 0.6 },
            { x: 270, y: 215, type: 'mug', scale: 0.8 },
            { x: 380, y: 325, type: 'clock', scale: 0.7 },
            { x: 420, y: 325, type: 'frame', scale: 0.7 },
            { x: 380, y: 225, type: 'plant', scale: 0.6 },
            { x: 420, y: 225, type: 'vase', scale: 0.7 },
            { x: 530, y: 215, type: 'book', scale: 0.9 },
            { x: 570, y: 215, type: 'pen', scale: 1.0 },
            { x: 580, y: 295, type: 'mug', scale: 0.8 },
            { x: 620, y: 295, type: 'remote', scale: 1.0 },
            { x: 630, y: 375, type: 'lamp', scale: 0.6 },
            { x: 670, y: 375, type: 'book', scale: 1.0 },
            { x: 380, y: 125, type: 'clock', scale: 0.7 },
            { x: 420, y: 125, type: 'vase', scale: 0.7 }
        ]
    }
};
