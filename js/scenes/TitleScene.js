// 共通定数
const W = 800, H = 550;

// タイトルシーン
class TitleScene extends Phaser.Scene {
    constructor() {
        super('TitleScene');
    }

    create() {
        createAllTextures(this);
        storyProgress.load();

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

        // 月
        this.add.image(620, 100, 'moon').setScale(1.0).setDepth(1);

        // 窓
        const wfx = this.add.graphics().setDepth(2);
        wfx.fillStyle(0x1a1a2a);
        wfx.fillRect(540, 30, 160, 220);
        wfx.fillStyle(0x0a0a1a);
        wfx.fillRect(550, 40, 65, 95);
        wfx.fillRect(625, 40, 65, 95);
        wfx.fillRect(550, 145, 65, 95);
        wfx.fillRect(625, 145, 65, 95);
        wfx.lineStyle(4, 0x2a2a4a);
        wfx.strokeRect(540, 30, 160, 220);

        // 猫シルエット
        const cat = this.add.image(610, 200, 'cat').setScale(2.2).setTint(0x000000).setAlpha(0.9).setDepth(3);
        this.tweens.add({
            targets: cat,
            y: 205,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // 猫の目（光る）
        const eyeL = this.add.circle(590, 186, 5, 0xffff66).setDepth(4);
        const eyeR = this.add.circle(614, 186, 5, 0xffff66).setDepth(4);
        this.tweens.add({
            targets: [eyeL, eyeR],
            alpha: 0.2,
            duration: 100,
            yoyo: true,
            repeat: -1,
            repeatDelay: 3000
        });

        // 月アイコン
        this.add.image(W / 2, 55, 'moon').setScale(0.6).setDepth(10);

        // タイトル
        const title = this.add.text(W / 2, 130, 'よるのうんどうかい', {
            fontSize: '44px',
            fontFamily: 'Fredoka One',
            color: '#ffffff',
            stroke: '#2a2a5a',
            strokeThickness: 8
        }).setOrigin(0.5).setDepth(10);
        this.tweens.add({
            targets: title,
            y: 135,
            duration: 2500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.add.text(W / 2, 180, 'Midnight Meowathon', {
            fontSize: '20px',
            color: '#7777aa'
        }).setOrigin(0.5).setDepth(10);

        this.add.text(W / 2, 255, '深夜、突然スイッチが入った猫になって\n飼い主が起きる前に家中で大暴れ！', {
            fontSize: '16px',
            color: '#9999bb',
            align: 'center',
            lineSpacing: 8
        }).setOrigin(0.5).setDepth(10);

        // ストーリーモードボタン
        this.createButton(W / 2, 330, 'ストーリーモード', () => {
            sound.init();
            sound.meowShort();
            this.cameras.main.fadeOut(400);
            this.time.delayedCall(400, () => this.scene.start('PowerUpScene'));
        });

        // 猫の集会ボタン（解禁条件）
        if (storyProgress.isGatheringUnlocked()) {
            this.createButton(W / 2, 400, '猫の集会', () => {
                sound.init();
                sound.meowShort();
                this.cameras.main.fadeOut(400);
                this.time.delayedCall(400, () => this.scene.start('GatheringScene'));
            }, 0x8a4a8a);
        }

        // 操作説明
        const controlText = DeviceDetector.isMobile()
            ? 'タッチ操作対応'
            : '← → 移動　　↑/Space ジャンプ　　壁+ジャンプ 壁キック';
        this.add.text(W / 2, 480, controlText, {
            fontSize: '14px',
            color: '#666688'
        }).setOrigin(0.5).setDepth(10);

        this.add.text(W / 2, 530, '© 2025 Midnight Meowathon', {
            fontSize: '11px',
            color: '#333355'
        }).setOrigin(0.5).setDepth(10);

        // デバッグボタン（右下隅）
        this.createDebugButton(W - 120, H - 60, '進捗リセット', () => {
            storyProgress.reset();
            storyProgress.save();
            sound.tone(300, 0.1);
            this.scene.restart();
        });

        this.createDebugButton(W - 120, H - 25, 'Stage1クリア', () => {
            storyProgress.reset();
            storyProgress.completeStage(1000);
            storyProgress.save();
            sound.tone(500, 0.1);
            this.scene.restart();
        });

        this.cameras.main.fadeIn(500);
    }

    createButton(x, y, text, callback, color = 0x4a4a8a) {
        const btnBg = this.add.rectangle(x, y, 240, 50, color)
            .setStrokeStyle(3, color + 0x303030)
            .setInteractive({ useHandCursor: true })
            .setDepth(10);

        const btnText = this.add.text(x, y, text, {
            fontSize: '22px',
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
        const btnBg = this.add.rectangle(x, y, 110, 25, 0x3a3a5a, 0.8)
            .setStrokeStyle(1, 0x5a5a7a)
            .setInteractive({ useHandCursor: true })
            .setDepth(10);

        const btnText = this.add.text(x, y, text, {
            fontSize: '11px',
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
}
