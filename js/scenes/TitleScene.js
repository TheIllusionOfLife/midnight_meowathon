// タイトルシーン
class TitleScene extends Phaser.Scene {
    constructor() {
        super('TitleScene');
    }

    create() {
        // Initialize responsive layout
        GameLayout.init(this);

        createAllTextures(this);
        storyProgress.load();

        // Listen for resize events
        this.scale.on('resize', this.handleResize, this);

        this.createUI();
        this.cameras.main.fadeIn(500);
    }

    handleResize(gameSize) {
        // Kill active tweens before destroying their targets
        this.tweens.killAll();
        // Recreate UI on resize (destroy children to prevent leaks)
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

        // パララックス星空（3層）
        for (let layer = 0; layer < 3; layer++) {
            const depth = 0.3 + layer * 0.2;
            const count = 20 + layer * 10;
            for (let i = 0; i < count; i++) {
                const star = this.add.circle(
                    Math.random() * W,
                    Math.random() * H * 0.7,
                    Math.random() * (1 + layer) + 0.5,
                    0xffffff,
                    Math.random() * 0.4 + 0.2
                ).setDepth(layer);
                this.tweens.add({
                    targets: star,
                    alpha: 0.1,
                    duration: 800 + Math.random() * 1500,
                    yoyo: true,
                    repeat: -1
                });
            }
        }

        // 月 - responsive positioning (avoid double moon in portrait)
        const moonX = GameLayout.isPortrait ? W * 0.5 : W * 0.78;
        const moonY = GameLayout.pctY(0.15);
        this.add.image(moonX, moonY, 'moon').setScale(GameLayout.scale(1.0)).setDepth(1);

        // 窓 - responsive sizing
        const windowScale = GameLayout.scale(1.0);
        const windowX = GameLayout.isPortrait ? W * 0.5 : W * 0.75;
        const windowY = GameLayout.pctY(0.25);
        const windowW = 160 * windowScale;
        const windowH = 220 * windowScale;

        const wfx = this.add.graphics().setDepth(2);
        wfx.fillStyle(0x1a1a2a);
        wfx.fillRect(windowX - windowW / 2, windowY - windowH / 2, windowW, windowH);
        wfx.fillStyle(0x0a0a1a);
        const paneW = 65 * windowScale;
        const paneH = 95 * windowScale;
        const paneGap = 10 * windowScale;
        wfx.fillRect(windowX - windowW / 2 + paneGap, windowY - windowH / 2 + paneGap, paneW, paneH);
        wfx.fillRect(windowX - windowW / 2 + paneGap + paneW + paneGap, windowY - windowH / 2 + paneGap, paneW, paneH);
        wfx.fillRect(windowX - windowW / 2 + paneGap, windowY - windowH / 2 + paneGap + paneH + paneGap, paneW, paneH);
        wfx.fillRect(windowX - windowW / 2 + paneGap + paneW + paneGap, windowY - windowH / 2 + paneGap + paneH + paneGap, paneW, paneH);
        wfx.lineStyle(4, 0x2a2a4a);
        wfx.strokeRect(windowX - windowW / 2, windowY - windowH / 2, windowW, windowH);

        // 猫シルエット
        const catScale = GameLayout.scale(2.2);
        const cat = this.add.image(windowX, windowY + 80 * windowScale, 'cat')
            .setScale(catScale)
            .setTint(0x000000)
            .setAlpha(0.9)
            .setDepth(3);
        this.tweens.add({
            targets: cat,
            y: windowY + 85 * windowScale,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // 猫の目（光る）
        const eyeSize = GameLayout.scale(5);
        const eyeL = this.add.circle(windowX - 20 * catScale, windowY + 66 * windowScale, eyeSize, 0xffff66).setDepth(4);
        const eyeR = this.add.circle(windowX + 24 * catScale, windowY + 66 * windowScale, eyeSize, 0xffff66).setDepth(4);
        this.tweens.add({
            targets: [eyeL, eyeR],
            alpha: 0.2,
            duration: 100,
            yoyo: true,
            repeat: -1,
            repeatDelay: 3000
        });

        // 月アイコン（縦画面では重複するため非表示）
        if (!GameLayout.isPortrait) {
            this.add.image(W / 2, GameLayout.pctY(0.08), 'moon').setScale(GameLayout.scale(0.6)).setDepth(10);
        }

        // タイトル - responsive font size
        const titleY = GameLayout.isPortrait ? GameLayout.pctY(0.20) : GameLayout.pctY(0.24);
        const title = this.add.text(W / 2, titleY, 'ねこのズーミーズ', {
            fontSize: GameLayout.fontSize(44) + 'px',
            fontFamily: 'Fredoka One',
            color: '#ffffff',
            stroke: '#2a2a5a',
            strokeThickness: GameLayout.scale(8)
        }).setOrigin(0.5).setDepth(10);
        this.tweens.add({
            targets: title,
            y: titleY + GameLayout.scale(5),
            duration: 2500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.add.text(W / 2, titleY + GameLayout.scale(50), 'Cat Zoomies', {
            fontSize: GameLayout.fontSize(20) + 'px',
            color: '#7777aa'
        }).setOrigin(0.5).setDepth(10);

        const descY = GameLayout.isPortrait ? GameLayout.pctY(0.38) : GameLayout.pctY(0.46);
        this.add.text(W / 2, descY, '深夜、突然スイッチが入った猫になって\n飼い主が起きる前に家中で大暴れ！', {
            fontSize: GameLayout.fontSize(16) + 'px',
            color: '#9999bb',
            align: 'center',
            lineSpacing: GameLayout.scale(8)
        }).setOrigin(0.5).setDepth(10);

        // ストーリーモードボタン - responsive positioning
        const buttonY1 = GameLayout.isPortrait ? GameLayout.pctY(0.52) : GameLayout.pctY(0.60);
        this.createButton(W / 2, buttonY1, 'ストーリーモード', () => {
            sound.init();
            sound.meowShort();
            this.cameras.main.fadeOut(400);
            this.time.delayedCall(400, () => this.scene.start('PowerUpScene'));
        });

        // 猫の集会ボタン（解禁条件）
        if (storyProgress.isGatheringUnlocked()) {
            const buttonY2 = GameLayout.isPortrait ? GameLayout.pctY(0.62) : GameLayout.pctY(0.73);
            this.createButton(W / 2, buttonY2, '猫の集会', () => {
                sound.init();
                sound.meowShort();
                this.cameras.main.fadeOut(400);
                this.time.delayedCall(400, () => this.scene.start('GatheringScene'));
            }, 0x8a4a8a);
        }

        // 操作説明
        const controlY = GameLayout.isPortrait ? GameLayout.pctY(0.83) : GameLayout.pctY(0.87);
        const controlText = DeviceDetector.isMobile()
            ? 'タッチ操作対応'
            : '← → 移動　　↑/Space ジャンプ　　壁+ジャンプ 壁キック';
        this.add.text(W / 2, controlY, controlText, {
            fontSize: GameLayout.fontSize(14) + 'px',
            color: '#666688'
        }).setOrigin(0.5).setDepth(10);

        const tipText = '壁に触れながらジャンプで壁キック！';
        const tipY = controlY + GameLayout.scale(30);
        const tipW = GameLayout.scale(280);
        const tipH = GameLayout.scale(36);
        const tipBg = this.add.rectangle(W / 2, tipY, tipW, tipH, 0x2a2a44, 0.9)
            .setStrokeStyle(2, 0x7777aa)
            .setDepth(10);
        this.add.text(W / 2, tipY, tipText, {
            fontSize: GameLayout.fontSize(14) + 'px',
            color: '#ffffaa',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(11);

        this.add.text(W / 2, GameLayout.pctY(0.96), '© 2025 Cat Zoomies', {
            fontSize: GameLayout.fontSize(11) + 'px',
            color: '#333355'
        }).setOrigin(0.5).setDepth(10);

        // デバッグボタン（右下隅）
        const debugX = W - GameLayout.scale(120);
        const debugY1 = H - GameLayout.scale(60);
        const debugY2 = H - GameLayout.scale(25);

        this.createDebugButton(debugX, debugY1, '進捗リセット', () => {
            storyProgress.reset();
            storyProgress.save();
            sound.tone(300, 0.1);
            this.scene.restart();
        });

        this.createDebugButton(debugX, debugY2, 'Stage1クリア', () => {
            storyProgress.reset();
            storyProgress.completeStage(1000);
            storyProgress.save();
            sound.tone(500, 0.1);
            this.scene.restart();
        });
    }

    createButton(x, y, text, callback, color = 0x4a4a8a) {
        const btnW = GameLayout.scale(240);
        const btnH = GameLayout.scale(50);
        const btnBg = this.add.rectangle(x, y, btnW, btnH, color)
            .setStrokeStyle(3, color + 0x303030)
            .setInteractive({ useHandCursor: true })
            .setDepth(10);

        const btnText = this.add.text(x, y, text, {
            fontSize: GameLayout.fontSize(22) + 'px',
            color: '#ffffff',
            fontFamily: 'Kosugi Maru'
        }).setOrigin(0.5).setDepth(11);

        btnBg.on('pointerover', () => {
            btnBg.setFillStyle(color + 0x202020);
            this.tweens.add({ targets: btnBg, scale: 1.05, duration: 100 });
        });
        btnBg.on('pointerout', () => {
            btnBg.setFillStyle(color);
            this.tweens.add({ targets: btnBg, scale: 1, duration: 100 });
        });
        btnBg.on('pointerdown', callback);

        return { bg: btnBg, text: btnText };
    }

    createDebugButton(x, y, text, callback) {
        const btnW = GameLayout.scale(110);
        const btnH = GameLayout.scale(25);
        const btnBg = this.add.rectangle(x, y, btnW, btnH, 0x3a3a5a, 0.8)
            .setStrokeStyle(1, 0x5a5a7a)
            .setInteractive({ useHandCursor: true })
            .setDepth(10);

        const btnText = this.add.text(x, y, text, {
            fontSize: GameLayout.fontSize(11) + 'px',
            color: '#ffffff',
            fontFamily: 'Kosugi Maru'
        }).setOrigin(0.5).setDepth(11);

        btnBg.on('pointerover', () => {
            btnBg.setFillStyle(0x5a5a7a, 0.9);
        });
        btnBg.on('pointerout', () => {
            btnBg.setFillStyle(0x3a3a5a, 0.8);
        });
        btnBg.on('pointerdown', callback);

        return { bg: btnBg, text: btnText };
    }

    shutdown() {
        this.scale.off('resize', this.handleResize, this);
    }
}
