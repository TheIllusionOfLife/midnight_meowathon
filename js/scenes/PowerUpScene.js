// パワーアップ選択シーン
class PowerUpScene extends Phaser.Scene {
    constructor() {
        super('PowerUpScene');
    }

    create() {
        // Initialize responsive layout
        GameLayout.init(this);

        // Listen for resize events
        this.scale.on('resize', this.handleResize, this);

        this.createUI();
        this.cameras.main.fadeIn(300);
    }

    handleResize(gameSize) {
        GameLayout.init(this);
        this.children.removeAll(true);
        this.createUI();
    }

    createUI() {
        const W = GameLayout.W;
        const H = GameLayout.H;

        // 背景
        const gfx = this.add.graphics();
        gfx.fillGradientStyle(0x0a0a18, 0x0a0a18, 0x12122a, 0x12122a);
        gfx.fillRect(0, 0, W, H);

        // タイトル
        this.add.text(W / 2, GameLayout.pctY(0.10), 'パワーアップを選択', {
            fontSize: GameLayout.fontSize(36) + 'px',
            fontFamily: 'Kosugi Maru',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#2a2a5a',
            strokeThickness: GameLayout.scale(6)
        }).setOrigin(0.5);

        // ステージ情報
        const stage = storyProgress.getCurrentStage();
        this.add.text(W / 2, GameLayout.pctY(0.18), `ステージ ${stage} / 5`, {
            fontSize: GameLayout.fontSize(20) + 'px',
            fontFamily: 'Kosugi Maru',
            color: '#aaaacc'
        }).setOrigin(0.5);

        // 現在のパワーアップ表示（画像に変更）
        if (powerUpManager.activePowerUps.length > 0) {
            this.add.text(W / 2, GameLayout.pctY(0.24), '現在のパワーアップ:', {
                fontSize: GameLayout.fontSize(14) + 'px',
                color: '#888899'
            }).setOrigin(0.5);

            const iconScale = GameLayout.scale(0.8);
            const iconSpacing = GameLayout.scale(35);
            powerUpManager.activePowerUps.forEach((id, index) => {
                const startX = W / 2 - (powerUpManager.activePowerUps.length * iconSpacing) / 2 + iconSpacing / 2;
                this.add.image(startX + index * iconSpacing, GameLayout.pctY(0.29), POWERUPS[id].icon)
                    .setScale(iconScale);
            });
        }

        // ランダムに3つのパワーアップを選択
        const options = powerUpManager.getRandomPowerUps(3);

        // パワーアップカードを表示 - responsive layout
        const cardY = GameLayout.isPortrait ? GameLayout.pctY(0.45) : GameLayout.pctY(0.55);

        if (GameLayout.isPortrait) {
            // Portrait: vertical stack
            options.forEach((id, index) => {
                this.createPowerUpCard(id, W / 2, cardY + index * GameLayout.scale(180));
            });
        } else {
            // Landscape: horizontal layout
            // Make spacing wider (was too cramped)
            const cardSpacing = Math.min(GameLayout.scale(250), W / 3.5);
            const startX = W / 2;

            // Calculate starting position to center the group
            // For 3 items: -1, 0, 1 * spacing
            options.forEach((id, index) => {
                const offsetIndex = index - 1; // 0->-1, 1->0, 2->1
                this.createPowerUpCard(id, startX + offsetIndex * cardSpacing, cardY);
            });
        }

        // スキップボタン（パワーアップなしで進む）
        const skipY = GameLayout.isPortrait ? GameLayout.pctY(0.92) : GameLayout.pctY(0.91);
        const skipBtn = this.add.rectangle(W / 2, skipY, GameLayout.scale(200), GameLayout.scale(40), 0x666677)
            .setStrokeStyle(2, 0x888899)
            .setInteractive({ useHandCursor: true });

        const skipText = this.add.text(W / 2, skipY, 'スキップ', {
            fontSize: GameLayout.fontSize(18) + 'px',
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
    }

    createPowerUpCard(powerUpId, x, y) {
        const powerUp = POWERUPS[powerUpId];
        const container = this.add.container(x, y);

        // カード背景 - responsive sizing
        const cardW = GameLayout.scale(200);
        const cardH = GameLayout.isPortrait ? GameLayout.scale(160) : GameLayout.scale(260);

        const rarityColors = {
            common: 0x4a4a6a,
            rare: 0x6a4a8a,
            epic: 0x8a4a6a
        };
        const bgColor = rarityColors[powerUp.rarity] || 0x4a4a6a;

        const card = this.add.rectangle(0, 0, cardW, cardH, bgColor)
            .setStrokeStyle(3, bgColor + 0x303030)
            .setInteractive({ useHandCursor: true });

        // アイコン（画像に変更）
        const iconY = GameLayout.isPortrait ? -cardH * 0.35 : -cardH * 0.33;
        const icon = this.add.image(0, iconY, powerUp.icon).setScale(GameLayout.scale(1.0));

        // 名前
        const nameY = GameLayout.isPortrait ? -cardH * 0.05 : -cardH * 0.15;
        const name = this.add.text(0, nameY, powerUp.name, {
            fontSize: GameLayout.fontSize(18) + 'px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // 説明
        const descY = GameLayout.isPortrait ? cardH * 0.25 : cardH * 0.04;
        const desc = this.add.text(0, descY, powerUp.description, {
            fontSize: GameLayout.fontSize(12) + 'px',
            color: '#ddddee',
            align: 'center',
            lineSpacing: 3,
            wordWrap: { width: cardW - GameLayout.scale(20) }
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

    shutdown() {
        this.scale.off('resize', this.handleResize, this);
    }
}
