// 猫の集会モード - タイムアタック形式

// ボス猫定義（タイムアタック用）
const BOSS_CATS = [
    {
        id: 'kuro',
        name: 'クロ',
        difficulty: 1,
        targetTime: 22.5, // 秒（半分に）
        color: 0x222222,
        description: '初心者向けの優しい猫\n目標: 22.5秒以内'
    },
    {
        id: 'shiro',
        name: 'シロ',
        difficulty: 2,
        targetTime: 17.5, // 半分に
        color: 0xeeeeee,
        description: '標準的な強さの猫\n目標: 17.5秒以内'
    },
    {
        id: 'mike',
        name: 'ミケ',
        difficulty: 3,
        targetTime: 14, // 半分に
        color: 0xff9933,
        description: '上級者向けの強い猫\n目標: 14秒以内'
    },
    {
        id: 'boss',
        name: 'ボス猫',
        difficulty: 4,
        targetTime: 11, // 半分に
        color: 0x8b4513,
        description: '最強の猫、全てを極めた者\n目標: 11秒以内'
    }
];

// ステージレイアウト定義
const GATHERING_STAGE_LAYOUTS = {
    kuro: {
        name: '初心者の部屋',
        platforms: [
            { x: 400, y: 500, w: 760, h: 10 }, // 床
            { x: 150, y: 400, w: 120, h: 10 }, // 左下棚
            { x: 650, y: 400, w: 120, h: 10 }, // 右下棚
            { x: 400, y: 280, w: 140, h: 10 }, // 中央棚
            { x: 200, y: 180, w: 100, h: 10 }, // 左上棚
            { x: 600, y: 180, w: 100, h: 10 }  // 右上棚
        ],
        items: [
            { x: 130, y: 375, type: 'vase', scale: 0.7 },
            { x: 170, y: 375, type: 'book', scale: 1.0 },
            { x: 630, y: 375, type: 'plant', scale: 0.6 },
            { x: 670, y: 375, type: 'mug', scale: 0.8 },
            { x: 380, y: 255, type: 'clock', scale: 0.7 },
            { x: 420, y: 255, type: 'lamp', scale: 0.6 },
            { x: 180, y: 155, type: 'frame', scale: 0.7 },
            { x: 220, y: 155, type: 'pen', scale: 1.0 },
            { x: 580, y: 155, type: 'remote', scale: 1.0 },
            { x: 620, y: 155, type: 'book', scale: 0.9 }
        ]
    },
    shiro: {
        name: '階段の部屋',
        platforms: [
            { x: 400, y: 500, w: 760, h: 10 }, // 床
            { x: 100, y: 450, w: 100, h: 10 }, // 階段1
            { x: 200, y: 380, w: 100, h: 10 }, // 階段2
            { x: 300, y: 310, w: 100, h: 10 }, // 階段3
            { x: 500, y: 310, w: 100, h: 10 }, // 階段4
            { x: 600, y: 380, w: 100, h: 10 }, // 階段5
            { x: 700, y: 450, w: 100, h: 10 }, // 階段6
            { x: 400, y: 180, w: 120, h: 10 }  // 頂上
        ],
        items: [
            { x: 80, y: 425, type: 'book', scale: 1.0 },
            { x: 120, y: 425, type: 'pen', scale: 1.0 },
            { x: 180, y: 355, type: 'mug', scale: 0.8 },
            { x: 220, y: 355, type: 'remote', scale: 1.0 },
            { x: 280, y: 285, type: 'vase', scale: 0.7 },
            { x: 320, y: 285, type: 'plant', scale: 0.6 },
            { x: 480, y: 285, type: 'lamp', scale: 0.6 },
            { x: 520, y: 285, type: 'frame', scale: 0.7 },
            { x: 580, y: 355, type: 'book', scale: 0.9 },
            { x: 620, y: 355, type: 'pen', scale: 1.0 },
            { x: 680, y: 425, type: 'mug', scale: 0.8 },
            { x: 720, y: 425, type: 'remote', scale: 1.0 },
            { x: 380, y: 155, type: 'clock', scale: 0.7 },
            { x: 420, y: 155, type: 'vase', scale: 0.7 }
        ]
    },
    mike: {
        name: '迷路の部屋',
        platforms: [
            { x: 400, y: 500, w: 760, h: 10 }, // 床
            { x: 100, y: 420, w: 80, h: 10 },  // 左下
            { x: 250, y: 350, w: 80, h: 10 },  // 左中
            { x: 100, y: 280, w: 80, h: 10 },  // 左上
            { x: 400, y: 380, w: 100, h: 10 }, // 中央
            { x: 550, y: 350, w: 80, h: 10 },  // 右中
            { x: 700, y: 420, w: 80, h: 10 },  // 右下
            { x: 700, y: 280, w: 80, h: 10 },  // 右上
            { x: 400, y: 200, w: 120, h: 10 }  // 最上部
        ],
        items: [
            { x: 80, y: 395, type: 'book', scale: 1.0 },
            { x: 120, y: 395, type: 'pen', scale: 1.0 },
            { x: 230, y: 325, type: 'mug', scale: 0.8 },
            { x: 270, y: 325, type: 'remote', scale: 1.0 },
            { x: 80, y: 255, type: 'vase', scale: 0.7 },
            { x: 120, y: 255, type: 'plant', scale: 0.6 },
            { x: 380, y: 355, type: 'lamp', scale: 0.6 },
            { x: 420, y: 355, type: 'frame', scale: 0.7 },
            { x: 530, y: 325, type: 'book', scale: 0.9 },
            { x: 570, y: 325, type: 'pen', scale: 1.0 },
            { x: 680, y: 395, type: 'mug', scale: 0.8 },
            { x: 720, y: 395, type: 'remote', scale: 1.0 },
            { x: 680, y: 255, type: 'plant', scale: 0.6 },
            { x: 720, y: 255, type: 'vase', scale: 0.7 },
            { x: 380, y: 175, type: 'clock', scale: 0.7 },
            { x: 420, y: 175, type: 'lamp', scale: 0.6 }
        ]
    },
    boss: {
        name: 'ボスの城',
        platforms: [
            { x: 400, y: 500, w: 760, h: 10 }, // 床
            { x: 80, y: 450, w: 60, h: 10 },   // 左端1
            { x: 720, y: 450, w: 60, h: 10 },  // 右端1
            { x: 150, y: 380, w: 60, h: 10 },  // 左2
            { x: 650, y: 380, w: 60, h: 10 },  // 右2
            { x: 250, y: 310, w: 60, h: 10 },  // 左3
            { x: 550, y: 310, w: 60, h: 10 },  // 右3
            { x: 350, y: 240, w: 60, h: 10 },  // 左4
            { x: 450, y: 240, w: 60, h: 10 },  // 右4
            { x: 400, y: 150, w: 80, h: 10 }   // 頂上
        ],
        items: [
            { x: 60, y: 425, type: 'pen', scale: 1.0 },
            { x: 100, y: 425, type: 'remote', scale: 1.0 },
            { x: 700, y: 425, type: 'pen', scale: 1.0 },
            { x: 740, y: 425, type: 'remote', scale: 1.0 },
            { x: 130, y: 355, type: 'book', scale: 1.0 },
            { x: 170, y: 355, type: 'mug', scale: 0.8 },
            { x: 630, y: 355, type: 'book', scale: 0.9 },
            { x: 670, y: 355, type: 'mug', scale: 0.8 },
            { x: 230, y: 285, type: 'vase', scale: 0.7 },
            { x: 270, y: 285, type: 'plant', scale: 0.6 },
            { x: 530, y: 285, type: 'vase', scale: 0.7 },
            { x: 570, y: 285, type: 'plant', scale: 0.6 },
            { x: 330, y: 215, type: 'lamp', scale: 0.6 },
            { x: 370, y: 215, type: 'frame', scale: 0.7 },
            { x: 430, y: 215, type: 'lamp', scale: 0.6 },
            { x: 470, y: 215, type: 'frame', scale: 0.7 },
            { x: 380, y: 125, type: 'clock', scale: 0.7 },
            { x: 420, y: 125, type: 'clock', scale: 0.7 }
        ]
    }
};

// タイムアタック用のルール
class TimeAttackRules {
    constructor(bossId) {
        const boss = BOSS_CATS.find(b => b.id === bossId);
        this.targetTime = boss.targetTime;
        this.bossName = boss.name;
    }

    checkWin(playerTime) {
        return playerTime < this.targetTime;
    }

    getTimeDifference(playerTime) {
        return playerTime - this.targetTime;
    }

    getRank(playerTime) {
        const diff = this.targetTime - playerTime;
        if (diff >= 10) return 'S';
        if (diff >= 5) return 'A';
        if (diff >= 0) return 'B';
        if (diff >= -5) return 'C';
        return 'D';
    }
}
