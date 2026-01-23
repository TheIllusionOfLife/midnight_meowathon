// ローグライトシステム - パワーアップ、バフ管理

// パワーアップ定義
const POWERUPS = {
    catnip: {
        id: 'catnip',
        name: 'マタタビ',
        icon: 'iconCatnip',
        effect: { speedMultiplier: 1.5 },
        sideEffect: { dragMultiplier: 0.6 }, // 滑りやすくなる
        description: '移動速度1.5倍！\nでもちょっと滑る…',
        rarity: 'common'
    },
    bell: {
        id: 'bell',
        name: '鈴',
        icon: 'iconBell',
        effect: { scoreMultiplier: 2.0 },
        sideEffect: { noiseMultiplier: 2.0 },
        description: 'スコア2倍！\n騒音も2倍！',
        rarity: 'common'
    },
    thunder: {
        id: 'thunder',
        name: '雷',
        icon: 'iconThunder',
        effect: { silentMode: true, silentDuration: 10 }, // 10秒間騒音ゼロ
        sideEffect: { cooldown: 60 }, // 60秒に1回のみ
        description: '10秒間完全無音！\nクールダウン60秒',
        rarity: 'rare'
    },
    fullMoon: {
        id: 'fullMoon',
        name: '満月',
        icon: 'iconMoon',
        effect: { jumpMultiplier: 1.4, doubleJump: true },
        sideEffect: { gravityMultiplier: 0.8 }, // ふわふわして制御しにくい
        description: 'ジャンプ力UP\n二段ジャンプ解禁！',
        rarity: 'rare'
    },
    fish: {
        id: 'fish',
        name: '焼き魚',
        icon: 'iconFish',
        effect: { noiseHealOnBreak: 5 }, // 破壊時に騒音-5
        sideEffect: { speedMultiplier: 0.9 },
        description: '破壊で騒音回復！\n少し遅くなる',
        rarity: 'common'
    },
    catToy: {
        id: 'catToy',
        name: '猫じゃらし',
        icon: 'iconCatToy',
        effect: { comboTimeMultiplier: 2.0 },
        sideEffect: { scoreMultiplier: 0.9 },
        description: 'コンボ時間2倍！\n基本スコア10%減',
        rarity: 'common'
    }
};

// パワーアップマネージャー
class PowerUpManager {
    constructor() {
        this.activePowerUps = [];
        this.maxPowerUps = 5;
        this.thunderCooldown = 0;
        this.thunderActive = false;
        this.thunderTimer = 0;
    }

    addPowerUp(powerUpId) {
        if (this.activePowerUps.length >= this.maxPowerUps) {
            console.warn('Maximum power-ups reached');
            return false;
        }

        const powerUp = POWERUPS[powerUpId];
        if (!powerUp) {
            console.warn('Invalid power-up ID:', powerUpId);
            return false;
        }

        this.activePowerUps.push(powerUpId);
        return true;
    }

    hasPowerUp(powerUpId) {
        return this.activePowerUps.includes(powerUpId);
    }

    getRandomPowerUps(count = 3) {
        const allIds = Object.keys(POWERUPS);
        const shuffled = Phaser.Utils.Array.Shuffle([...allIds]);
        return shuffled.slice(0, count);
    }

    // 統合された効果値を計算
    getMultiplier(type) {
        let multiplier = 1.0;

        this.activePowerUps.forEach(id => {
            const powerUp = POWERUPS[id];
            if (!powerUp) {
                console.warn(`Unknown power-up ID: ${id}`);
                return;
            }
            if (powerUp.effect && powerUp.effect[type]) {
                multiplier *= powerUp.effect[type];
            }
            if (powerUp.sideEffect && powerUp.sideEffect[type]) {
                multiplier *= powerUp.sideEffect[type];
            }
        });

        return multiplier;
    }

    hasEffect(effectName) {
        return this.activePowerUps.some(id => {
            const powerUp = POWERUPS[id];
            if (!powerUp) return false;
            return (powerUp.effect && powerUp.effect[effectName]) ||
                   (powerUp.sideEffect && powerUp.sideEffect[effectName]);
        });
    }

    getEffectValue(effectName) {
        for (let id of this.activePowerUps) {
            const powerUp = POWERUPS[id];
            if (!powerUp) continue;
            if (powerUp.effect && powerUp.effect[effectName] !== undefined) {
                return powerUp.effect[effectName];
            }
            if (powerUp.sideEffect && powerUp.sideEffect[effectName] !== undefined) {
                return powerUp.sideEffect[effectName];
            }
        }
        return null;
    }

    // 雷のサイレントモード管理
    update(delta) {
        if (this.thunderCooldown > 0) {
            this.thunderCooldown -= delta / 1000;
        }

        if (this.thunderActive) {
            this.thunderTimer -= delta / 1000;
            if (this.thunderTimer <= 0) {
                this.thunderActive = false;
            }
        }
    }

    activateThunder() {
        if (!this.hasPowerUp('thunder')) return false;
        if (this.thunderCooldown > 0) return false;

        const duration = this.getEffectValue('silentDuration');
        const cooldown = this.getEffectValue('cooldown');

        this.thunderActive = true;
        this.thunderTimer = duration;
        this.thunderCooldown = cooldown;

        return true;
    }

    isThunderActive() {
        return this.thunderActive;
    }

    getThunderCooldown() {
        return Math.max(0, this.thunderCooldown);
    }

    getThunderRemaining() {
        return Math.max(0, this.thunderTimer);
    }

    // セーブ/ロード用
    serialize() {
        return {
            activePowerUps: this.activePowerUps,
            thunderCooldown: this.thunderCooldown
        };
    }

    deserialize(data) {
        this.activePowerUps = data.activePowerUps || [];
        this.thunderCooldown = data.thunderCooldown || 0;
    }

    reset() {
        this.activePowerUps = [];
        this.thunderCooldown = 0;
        this.thunderActive = false;
        this.thunderTimer = 0;
    }
}

// グローバルインスタンス
const powerUpManager = new PowerUpManager();

// ストーリーモード進行管理
class StoryProgress {
    constructor() {
        this.currentStage = 1;
        this.maxStage = 5;
        this.totalScore = 0;
        this.stagesCleared = 0;
        this.gatheringUnlocked = false;
    }

    completeStage(score) {
        this.totalScore += score;
        this.stagesCleared++;

        if (this.stagesCleared >= 1) {
            this.gatheringUnlocked = true;
        }

        if (this.currentStage < this.maxStage) {
            this.currentStage++;
            return { continue: true, completed: false, ending: false };
        } else {
            // 全ステージクリア後はステージ1に戻る
            this.currentStage = 1;
            return { continue: true, completed: true, ending: true };
        }
    }

    isGatheringUnlocked() {
        return this.gatheringUnlocked;
    }

    getCurrentStage() {
        return this.currentStage;
    }

    getTotalScore() {
        return this.totalScore;
    }

    serialize() {
        return {
            currentStage: this.currentStage,
            totalScore: this.totalScore,
            stagesCleared: this.stagesCleared,
            gatheringUnlocked: this.gatheringUnlocked,
            powerUps: powerUpManager.serialize()
        };
    }

    deserialize(data) {
        this.currentStage = data.currentStage || 1;
        this.totalScore = data.totalScore || 0;
        this.stagesCleared = data.stagesCleared || 0;
        this.gatheringUnlocked = data.gatheringUnlocked || false;
        if (data.powerUps) {
            powerUpManager.deserialize(data.powerUps);
        }
    }

    reset() {
        this.currentStage = 1;
        this.totalScore = 0;
        this.stagesCleared = 0;
        this.gatheringUnlocked = false;
        powerUpManager.reset();
    }

    // ローカルストレージに保存
    save() {
        try {
            const data = this.serialize();
            localStorage.setItem('midnight_meowathon_progress', JSON.stringify(data));
        } catch (e) {
            console.warn('Failed to save progress:', e);
        }
    }

    // ローカルストレージから読み込み
    load() {
        try {
            const data = localStorage.getItem('midnight_meowathon_progress');
            if (data) {
                this.deserialize(JSON.parse(data));
                return true;
            }
        } catch (e) {
            console.warn('Failed to load progress:', e);
        }
        return false;
    }
}

// グローバルインスタンス
const storyProgress = new StoryProgress();
