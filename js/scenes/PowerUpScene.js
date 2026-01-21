// パワーアップ選択シーン
class PowerUpScene extends Phaser.Scene {
    constructor() {
        super('PowerUpScene');
    }

    create() {
        // 背景
        const gfx = this.add.graphics();
        gfx.fillGradientStyle(0x0a0a18, 0x0a0a18, 0x12122a, 0x12122a);
        gfx.fillRect(0, 0, W, H);

        // タイトル
        this.add.text(W / 2, 60, 'パワーアップを選択', {
            fontSize: '36px',
            fontFamily: 'Kosugi Maru',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#2a2a5a',
            strokeThickness: 6
        }).setOrigin(0.5);

        // ステージ情報
        const stage = storyProgress.getCurrentStage();
        this.add.text(W / 2, 110, `ステージ ${stage} / 5`, {
            fontSize: '20px',
            fontFamily: 'Kosugi Maru',
            color: '#aaaacc'
        }).setOrigin(0.5);

        // 現在のパワーアップ表示（画像に変更）
        if (powerUpManager.activePowerUps.length > 0) {
            this.add.text(W / 2, 140, '現在のパワーアップ:', {
                fontSize: '14px',
                color: '#888899'
            }).setOrigin(0.5);

            powerUpManager.activePowerUps.forEach((id, index) => {
                const startX = W / 2 - (powerUpManager.activePowerUps.length * 35) / 2 + 20;
                this.add.image(startX + index * 35, 165, POWERUPS[id].icon)
                    .setScale(0.8);
            });
        }

        // ランダムに3つのパワーアップを選択
        const options = powerUpManager.getRandomPowerUps(3);

        // パワーアップカードを表示
        options.forEach((id, index) => {
            this.createPowerUpCard(id, 150 + index * 220, 300);
        });

        // スキップボタン（パワーアップなしで進む）
        const skipBtn = this.add.rectangle(W / 2, 500, 200, 40, 0x666677)
            .setStrokeStyle(2, 0x888899)
            .setInteractive({ useHandCursor: true });

        const skipText = this.add.text(W / 2, 500, 'スキップ', {
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0.5);

        skipBtn.on('pointerover', () => {
            skipBtn.setFillStyle(0x777788);
        });
        skipBtn.on('pointerout', () => {
            skipBtn.setFillStyle(0x666677);
        });
        skipBtn.on('pointerdown', () => {
            sound.tone(300, 0.1);
            this.startGame();
        });

        this.cameras.main.fadeIn(300);
    }

    createPowerUpCard(powerUpId, x, y) {
        const powerUp = POWERUPS[powerUpId];
        const container = this.add.container(x, y);

        // カード背景
        const rarityColors = {
            common: 0x4a4a6a,
            rare: 0x6a4a8a,
            epic: 0x8a4a6a
        };
        const bgColor = rarityColors[powerUp.rarity] || 0x4a4a6a;

        const card = this.add.rectangle(0, 0, 200, 260, bgColor)
            .setStrokeStyle(3, bgColor + 0x303030)
            .setInteractive({ useHandCursor: true });

        // アイコン（画像に変更）
        const icon = this.add.image(0, -85, powerUp.icon).setScale(1.0);

        // 名前
        const name = this.add.text(0, -40, powerUp.name, {
            fontSize: '18px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // 説明
        const desc = this.add.text(0, 10, powerUp.description, {
            fontSize: '12px',
            color: '#ddddee',
            align: 'center',
            lineSpacing: 3,
            wordWrap: { width: 180 }
        }).setOrigin(0.5);

        container.add([card, icon, name, desc]);

        // ホバーエフェクト
        card.on('pointerover', () => {
            card.setFillStyle(bgColor + 0x202020);
            this.tweens.add({
                targets: container,
                scale: 1.05,
                duration: 150,
                ease: 'Back.easeOut'
            });
        });

        card.on('pointerout', () => {
            card.setFillStyle(bgColor);
            this.tweens.add({
                targets: container,
                scale: 1,
                duration: 150
            });
        });

        // 選択時
        card.on('pointerdown', () => {
            powerUpManager.addPowerUp(powerUpId);
            sound.meow();

            // 選択エフェクト
            EnhancedParticles.createSparkles(this, x, y, 15, 0xffdd00);

            this.tweens.add({
                targets: container,
                scale: 1.2,
                alpha: 0,
                duration: 300,
                onComplete: () => {
                    this.startGame();
                }
            });
        });
    }

    startGame() {
        this.cameras.main.fadeOut(400);
        this.time.delayedCall(400, () => {
            this.scene.start('GameScene');
        });
    }
}
