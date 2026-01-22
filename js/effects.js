// エフェクトシステム - パーティクル、吹き出し、コンボ演出

// 猫語吹き出しシステム
class SpeechBubble {
    constructor(scene, x, y, text, duration = 1500) {
        this.scene = scene;
        this.container = scene.add.container(x, y).setDepth(150);

        // 吹き出し背景
        const bubbleWidth = text.length * 16 + 20;
        const bubbleHeight = 32;

        const bubble = scene.add.graphics();
        bubble.fillStyle(0xffffff, 0.95);
        bubble.lineStyle(2, 0x333333, 1);

        // 丸角矩形
        bubble.fillRoundedRect(-bubbleWidth / 2, -bubbleHeight, bubbleWidth, bubbleHeight, 8);
        bubble.strokeRoundedRect(-bubbleWidth / 2, -bubbleHeight, bubbleWidth, bubbleHeight, 8);

        // しっぽ
        bubble.fillTriangle(-8, -2, 0, 0, 8, -2);
        bubble.strokeTriangle(-8, -2, 0, 0, 8, -2);

        // テキスト
        const textObj = scene.add.text(0, -bubbleHeight / 2, text, {
            fontSize: '14px',
            color: '#333333',
            fontFamily: 'sans-serif',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.container.add([bubble, textObj]);

        // アニメーション
        this.container.setScale(0);
        scene.tweens.add({
            targets: this.container,
            scale: 1,
            duration: 150,
            ease: 'Back.easeOut'
        });

        // 自動削除
        scene.time.delayedCall(duration, () => {
            scene.tweens.add({
                targets: this.container,
                alpha: 0,
                y: this.container.y - 20,
                duration: 200,
                onComplete: () => this.container.destroy()
            });
        });
    }
}

// 猫語データベース
const CAT_DIALOGUES = {
    jump: ['にゃ！', 'にゃっ', 'ふにゃ'],
    wallKick: ['にゃにゃっ！', 'にゃーん', 'ふんっ'],
    break: ['にゃー！', 'がしゃーん♪', 'やったにゃ'],
    combo: ['にゃにゃ！', 'にゃーん♪', 'にゃっにゃっ'],
    danger: ['しーっ…', 'にゃ…', 'そーっと…'],
    victory: ['にゃーん！', 'にゃにゃ～♪', 'にゃっほー！'],
    defeat: ['にゃぁ…', 'にゃう…', 'むむむ…']
};

// 吹き出しクールダウン管理
const speechCooldowns = {};

// ランダムに吹き出しを表示（クールダウン付き）
function showCatDialogue(scene, x, y, category) {
    const now = Date.now();
    const cooldownKey = `${category}_${Math.floor(x)}_${Math.floor(y)}`;

    // Cleanup old entries periodically (older than 10 seconds)
    if (Object.keys(speechCooldowns).length > 100) {
        Object.keys(speechCooldowns).forEach(key => {
            if (now - speechCooldowns[key] > 10000) {
                delete speechCooldowns[key];
            }
        });
    }

    // クールダウンチェック（カテゴリごとに2秒）
    if (speechCooldowns[cooldownKey] && now - speechCooldowns[cooldownKey] < 2000) {
        return null;
    }

    speechCooldowns[cooldownKey] = now;

    const dialogues = CAT_DIALOGUES[category] || ['にゃー'];
    const text = Phaser.Utils.Array.GetRandom(dialogues);
    return new SpeechBubble(scene, x, y - 40, text);
}

// 強化パーティクルシステム
class EnhancedParticles {
    // キラキラエフェクト（コンボ用）
    static createSparkles(scene, x, y, count = 10, color = 0xffff00) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const distance = 30 + Math.random() * 20;
            const targetX = x + Math.cos(angle) * distance;
            const targetY = y + Math.sin(angle) * distance;

            const sparkle = scene.add.star(x, y, 4, 3, 6, color, 1).setDepth(100);

            scene.tweens.add({
                targets: sparkle,
                x: targetX,
                y: targetY,
                alpha: 0,
                scale: 0.3,
                angle: 360,
                duration: 500 + Math.random() * 300,
                ease: 'Cubic.easeOut',
                onComplete: () => sparkle.destroy()
            });
        }
    }

    // 破片エフェクト（強化版）
    static createShards(scene, x, y, color, count = 12, scoreValue = 100) {
        for (let i = 0; i < count; i++) {
            const size = Phaser.Math.Between(4, 12);
            const shard = scene.add.rectangle(x, y, size, size, color).setDepth(50);

            const physics = scene.physics.add.existing(shard);
            shard.body.setVelocity(
                Phaser.Math.Between(-300, 300),
                Phaser.Math.Between(-400, -150)
            );
            shard.body.setAngularVelocity(Phaser.Math.Between(-600, 600));
            shard.body.setGravityY(800);

            // 色の変化
            scene.tweens.add({
                targets: shard,
                alpha: 0,
                duration: 600 + Math.random() * 400,
                onComplete: () => shard.destroy()
            });
        }

        // 中心に衝撃波
        const wave = scene.add.circle(x, y, 10, color, 0.6).setDepth(50);
        scene.tweens.add({
            targets: wave,
            scale: 3,
            alpha: 0,
            duration: 400,
            ease: 'Cubic.easeOut',
            onComplete: () => wave.destroy()
        });
    }

    // オーラエフェクト（コンボ時）
    static createAura(scene, target, color = 0xff6600, duration = 2000) {
        const aura = scene.add.circle(0, 0, 50, color, 0.3).setDepth(40);

        const updateAura = () => {
            if (target && target.active) {
                aura.setPosition(target.x, target.y);
            } else {
                aura.destroy();
            }
        };

        scene.events.on('update', updateAura);

        scene.tweens.add({
            targets: aura,
            scale: 1.3,
            alpha: 0.1,
            duration: 800,
            yoyo: true,
            repeat: Math.floor(duration / 1600),
            onComplete: () => {
                scene.events.off('update', updateAura);
                aura.destroy();
            }
        });

        return aura;
    }

    // 虹色オーラ（高コンボ用）
    static createRainbowAura(scene, target, duration = 3000) {
        const colors = [0xff0000, 0xff7700, 0xffff00, 0x00ff00, 0x0077ff, 0x7700ff];
        const auras = [];

        colors.forEach((color, index) => {
            const aura = scene.add.circle(0, 0, 60 + index * 5, color, 0.2).setDepth(40);
            auras.push(aura);

            scene.tweens.add({
                targets: aura,
                angle: 360,
                duration: 2000 + index * 200,
                repeat: -1
            });
        });

        const updateAuras = () => {
            if (target && target.active) {
                auras.forEach(aura => aura.setPosition(target.x, target.y));
            } else {
                auras.forEach(aura => aura.destroy());
                scene.events.off('update', updateAuras);
            }
        };

        scene.events.on('update', updateAuras);

        scene.time.delayedCall(duration, () => {
            scene.events.off('update', updateAuras);
            auras.forEach(aura => {
                scene.tweens.add({
                    targets: aura,
                    alpha: 0,
                    duration: 500,
                    onComplete: () => aura.destroy()
                });
            });
        });

        return auras;
    }

    // 画面周囲エフェクト（高コンボ用）
    static createScreenBorder(scene, color = 0xff00ff, thickness = 8, duration = 2000) {
        const W = scene.scale.width;
        const H = scene.scale.height;

        const borders = [
            scene.add.rectangle(W / 2, thickness / 2, W, thickness, color, 0.6).setDepth(200),
            scene.add.rectangle(W / 2, H - thickness / 2, W, thickness, color, 0.6).setDepth(200),
            scene.add.rectangle(thickness / 2, H / 2, thickness, H, color, 0.6).setDepth(200),
            scene.add.rectangle(W - thickness / 2, H / 2, thickness, H, color, 0.6).setDepth(200)
        ];

        borders.forEach(border => {
            scene.tweens.add({
                targets: border,
                alpha: 0.2,
                duration: 400,
                yoyo: true,
                repeat: Math.floor(duration / 800),
                onComplete: () => border.destroy()
            });
        });

        return borders;
    }

    // 旋回エフェクト（10コンボ以上）
    static createOrbitingStars(scene, target, count = 8, duration = 3000) {
        const stars = [];
        const radius = 60;

        for (let i = 0; i < count; i++) {
            const star = scene.add.star(0, 0, 5, 4, 8, 0xffff00, 1).setDepth(100);
            stars.push(star);

            const angle = (Math.PI * 2 * i) / count;

            scene.tweens.add({
                targets: star,
                angle: 360,
                duration: 1500,
                repeat: -1
            });
        }

        let elapsed = 0;
        const updateStars = (time, delta) => {
            elapsed += delta;
            if (elapsed > duration) {
                scene.events.off('update', updateStars);
                stars.forEach(star => {
                    scene.tweens.add({
                        targets: star,
                        alpha: 0,
                        scale: 0,
                        duration: 300,
                        onComplete: () => star.destroy()
                    });
                });
                return;
            }

            if (target && target.active) {
                stars.forEach((star, index) => {
                    const angle = (Math.PI * 2 * index) / count + (elapsed / 1000);
                    star.setPosition(
                        target.x + Math.cos(angle) * radius,
                        target.y + Math.sin(angle) * radius
                    );
                });
            }
        };

        scene.events.on('update', updateStars);

        return stars;
    }

    // ダストバースト（着地・壁キック用）
    static createDustBurst(scene, x, y, count = 8, direction = 'down') {
        for (let i = 0; i < count; i++) {
            const dust = scene.add.circle(x, y, 3 + Math.random() * 4, 0xaaaaaa, 0.7).setDepth(50);

            let vx, vy;
            if (direction === 'down') {
                vx = Phaser.Math.Between(-60, 60);
                vy = Phaser.Math.Between(-40, 20);
            } else if (direction === 'left') {
                vx = Phaser.Math.Between(-80, -20);
                vy = Phaser.Math.Between(-30, 30);
            } else if (direction === 'right') {
                vx = Phaser.Math.Between(20, 80);
                vy = Phaser.Math.Between(-30, 30);
            }

            scene.tweens.add({
                targets: dust,
                x: dust.x + vx,
                y: dust.y + vy,
                alpha: 0,
                scale: 0.2,
                duration: 400 + Math.random() * 200,
                ease: 'Cubic.easeOut',
                onComplete: () => dust.destroy()
            });
        }
    }
}

// コンボ演出マネージャー
class ComboEffects {
    static show(scene, combo, x, y, catTarget) {
        if (combo === 2) {
            // 小さな星
            EnhancedParticles.createSparkles(scene, x, y, 5, 0xffdd00);
            showCatDialogue(scene, x, y, 'combo');
        } else if (combo === 5) {
            // 画面周囲に虹色オーラ
            EnhancedParticles.createScreenBorder(scene, 0xff00ff, 10, 2000);
            EnhancedParticles.createSparkles(scene, x, y, 12, 0xff00ff);
            showCatDialogue(scene, x, y, 'combo');
            sound.meowShort();
        } else if (combo === 10) {
            // 猫の周りにオーラ旋回
            EnhancedParticles.createOrbitingStars(scene, catTarget, 8, 3000);
            EnhancedParticles.createRainbowAura(scene, catTarget, 3000);
            showCatDialogue(scene, x, y, 'combo');
            sound.purr();
        } else if (combo >= 15) {
            // 背景フラッシュ（ネオンカラー）
            const flash = scene.add.rectangle(
                scene.scale.width / 2,
                scene.scale.height / 2,
                scene.scale.width,
                scene.scale.height,
                Phaser.Utils.Array.GetRandom([0xff00ff, 0x00ffff, 0xffff00]),
                0.3
            ).setDepth(199);

            scene.tweens.add({
                targets: flash,
                alpha: 0,
                duration: 200,
                onComplete: () => flash.destroy()
            });

            EnhancedParticles.createOrbitingStars(scene, catTarget, 12, 4000);
            EnhancedParticles.createRainbowAura(scene, catTarget, 4000);
            showCatDialogue(scene, x, y, 'combo');
            sound.victoryMeow();
        }
    }
}

// 勝利エフェクト
class VictoryEffects {
    static show(scene, x, y) {
        // 紙吹雪
        for (let i = 0; i < 50; i++) {
            const confetti = scene.add.rectangle(
                Phaser.Math.Between(0, scene.scale.width),
                -20,
                8,
                12,
                Phaser.Utils.Array.GetRandom([0xff0000, 0xff7700, 0xffff00, 0x00ff00, 0x0077ff, 0x7700ff])
            ).setDepth(150);

            const physics = scene.physics.add.existing(confetti);
            confetti.body.setVelocity(
                Phaser.Math.Between(-100, 100),
                Phaser.Math.Between(100, 300)
            );
            confetti.body.setAngularVelocity(Phaser.Math.Between(-300, 300));
            confetti.body.setGravityY(200);

            scene.time.delayedCall(5000, () => confetti.destroy());
        }

        // 中央に大きな星
        const bigStar = scene.add.star(x, y, 8, 20, 40, 0xffff00, 1).setDepth(150).setScale(0);
        scene.tweens.add({
            targets: bigStar,
            scale: 1.5,
            angle: 360,
            duration: 1000,
            ease: 'Back.easeOut'
        });

        scene.tweens.add({
            targets: bigStar,
            alpha: 0,
            delay: 2000,
            duration: 500,
            onComplete: () => bigStar.destroy()
        });
    }
}
