// 猫の集会シーン - タイムアタック形式
class GatheringScene extends Phaser.Scene {
    constructor() {
        super('GatheringScene');
    }

    create() {
        // Initialize responsive layout
        GameLayout.init(this);

        // Resize listener
        this.scale.on('resize', this.handleResize, this);

        // テクスチャ生成（黒画面修正）
        createAllTextures(this);

        // 初期化フラグ
        this.isInitialized = false;
        this.selectedBoss = null;

        // ボス選択画面
        this.showBossSelection();
    }

    handleResize(gameSize) {
        // Update GameLayout
        GameLayout.init(this);

        if (!this.selectedBoss) {
            // In Boss Selection Screen - Rebuild UI
            this.children.removeAll(true);
            this.cameras.main.setZoom(1);
            this.cameras.main.centerOn(GameLayout.W / 2, GameLayout.H / 2);
            this.showBossSelection(); // Re-creates responsive UI
        } else {
            // In Gameplay - Zoom to fit 800x550 logical world
            const screenW = gameSize.width;
            const screenH = gameSize.height;
            const worldW = 800;
            const worldH = 550;

            const zoomX = screenW / worldW;
            const zoomY = screenH / worldH;
            const zoom = Math.min(zoomX, zoomY);

            this.cameras.main.setZoom(zoom);
            this.cameras.main.removeBounds();
            this.cameras.main.centerOn(worldW / 2, worldH / 2);

            if (this.joystick && this.jumpBtn) {
                updateMobileControlsForScreen(this.joystick, this.jumpBtn, this.cameras.main, screenW, screenH);
            }
        }
    }

    showBossSelection() {
        const W = GameLayout.W;
        const H = GameLayout.H;

        // 背景
        const gfx = this.add.graphics();
        gfx.fillGradientStyle(0x0a0a18, 0x0a0a18, 0x12122a, 0x12122a);
        gfx.fillRect(0, 0, W, H);

        // タイトル
        const titleSize = GameLayout.fontSize(36) + 'px';
        this.add.text(W / 2, H * 0.1, '猫の集会 - タイムアタック', {
            fontSize: titleSize,
            fontFamily: 'Kosugi Maru',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#2a2a5a',
            strokeThickness: 6
        }).setOrigin(0.5);

        this.add.text(W / 2, H * 0.18, '対戦相手を選択', {
            fontSize: GameLayout.fontSize(20) + 'px',
            fontFamily: 'Kosugi Maru',
            color: '#aaaacc'
        }).setOrigin(0.5);

        // ボス猫カード - Responsive Layout
        if (GameLayout.isPortrait) {
            // 2x2 Grid or Vertical Stack
            const startY = H * 0.25;
            const spacer = H * 0.14;
            BOSS_CATS.forEach((boss, index) => {
                // 2 columns
                const col = index % 2;
                const row = Math.floor(index / 2);
                const cx = W * 0.3 + col * (W * 0.4);
                const cy = startY + row * (H * 0.25) + 60;
                this.createBossCard(boss, cx, cy, 0.8); // Slightly smaller
            });
        } else {
            // Horizontal Spread
            const cardSpacing = Math.min(GameLayout.scale(180), W / 4.5);
            const startX = W / 2 - (cardSpacing * 1.5);
            BOSS_CATS.forEach((boss, index) => {
                this.createBossCard(boss, startX + index * cardSpacing, H * 0.55);
            });
        }

        // 戻るボタン
        const btnY = H * 0.9;
        const backBtn = this.add.rectangle(W / 2, btnY, GameLayout.scale(200), GameLayout.scale(40), 0x666677)
            .setStrokeStyle(2, 0x888899)
            .setInteractive({ useHandCursor: true });

        const backText = this.add.text(W / 2, btnY, 'タイトルへ', {
            fontSize: GameLayout.fontSize(18) + 'px',
            color: '#ffffff'
        }).setOrigin(0.5);

        backBtn.on('pointerover', () => backBtn.setFillStyle(0x777788));
        backBtn.on('pointerout', () => backBtn.setFillStyle(0x666677));
        backBtn.on('pointerdown', () => {
            sound.tone(300, 0.1);
            this.scene.start('TitleScene');
        });

        // Ensure resizing doesn't trigger fade again if just resizing
        // this.cameras.main.fadeIn(300); 
    }

    createBossCard(boss, x, y, scale = 1.0) {
        const container = this.add.container(x, y).setScale(scale);

        // 難易度による色
        const difficultyColors = [0x4a6a4a, 0x6a6a4a, 0x8a4a4a, 0x8a4a8a];
        const bgColor = difficultyColors[boss.difficulty - 1] || 0x4a4a6a;

        // カード背景
        const card = this.add.rectangle(0, 0, 160, 220, bgColor)
            .setStrokeStyle(3, bgColor + 0x303030)
            .setInteractive({ useHandCursor: true });

        // 猫アイコン（色付き）
        const catIcon = this.add.image(0, -70, 'cat').setScale(0.7).setTint(boss.color);

        // 名前
        const name = this.add.text(0, -15, boss.name, {
            fontSize: '18px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // 難易度
        const stars = '★'.repeat(boss.difficulty) + '☆'.repeat(4 - boss.difficulty);
        const difficulty = this.add.text(0, 10, stars, {
            fontSize: '14px',
            color: '#ffdd00'
        }).setOrigin(0.5);

        // 説明
        const desc = this.add.text(0, 50, boss.description, {
            fontSize: '11px',
            color: '#ddddee',
            align: 'center',
            lineSpacing: 2,
            wordWrap: { width: 140 }
        }).setOrigin(0.5);

        container.add([card, catIcon, name, difficulty, desc]);

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
            sound.meow();
            this.tweens.add({
                targets: container,
                scale: 1.2,
                alpha: 0,
                duration: 300,
                onComplete: () => {
                    this.startTimeAttack(boss);
                }
            });
        });
    }

    startTimeAttack(boss) {
        this.selectedBoss = boss;
        this.cameras.main.fadeOut(400);
        this.time.delayedCall(400, () => {
            // シーンをクリアしてタイムアタック開始
            this.children.removeAll(true);
            this.initTimeAttack();
            // 黒画面修正：カメラをフェードイン
            this.cameras.main.fadeIn(300);
        });
    }

    initTimeAttack() {
        // ゲーム状態初期化
        this.gameEnded = false;
        this.score = 0;
        this.brokenCount = 0;
        this.startTime = null;
        this.elapsedTime = 0;

        const layout = GATHERING_STAGE_LAYOUTS[this.selectedBoss.id];
        this.currentLayout = layout;
        this.totalItems = layout.items.length;

        // 背景 (Cover large area for camera zoom/overscan)
        const gfx = this.add.graphics();
        gfx.fillGradientStyle(0x10101a, 0x10101a, 0x1a1a2a, 0x1a1a2a);
        gfx.fillRect(-1000, -1000, 2800, 2550);

        // ステージ名表示
        const stageNameBg = this.add.rectangle(400, 30, 300, 40, 0x000000, 0.7)
            .setDepth(100);
        this.add.text(400, 30, layout.name, {
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(101);

        // 物理グループ
        this.platforms = this.physics.add.staticGroup();
        this.walls = this.physics.add.staticGroup();
        this.breakables = this.physics.add.group({ allowGravity: false });

        // ステージ構築
        this.createStage(layout);
        this.createCat();
        this.createUI();
        this.setupInput();
        this.setupCollisions();

        // カウントダウン
        this.showCountdown();
    }

    createStage(layout) {
        // 壁 (Fixed 800x550 bounds)
        this.addWall(8, 275, 16, 550);
        this.addWall(792, 275, 16, 550);

        // プラットフォーム
        layout.platforms.forEach(p => {
            this.addPlatform(p.x, p.y, p.w, p.h, 0x5a5040);
        });

        // アイテム
        layout.items.forEach(item => {
            this.spawnBreakable(item.x, item.y, item.type, item.scale);
        });
    }

    addPlatform(x, y, w, h, color) {
        const p = this.add.rectangle(x, y, w, h, color);
        this.physics.add.existing(p, true);
        this.platforms.add(p);
        return p;
    }

    addWall(x, y, w, h) {
        const wall = this.add.rectangle(x, y, w, h, 0x101015, 0);
        this.physics.add.existing(wall, true);
        this.walls.add(wall);
    }

    spawnBreakable(x, y, type, scale) {
        const scores = { vase: 200, book: 50, clock: 300, plant: 150, lamp: 180, mug: 80, frame: 120, remote: 30, pen: 10 };
        const sprite = this.physics.add.sprite(x, y, type).setScale(scale);
        sprite.body.setAllowGravity(false);
        sprite.body.setImmovable(true);
        sprite.setData('type', type);
        sprite.setData('scoreValue', scores[type] || 50);
        sprite.setData('isFalling', false);
        sprite.setData('isBroken', false);
        this.breakables.add(sprite);
    }

    createCat() {
        const layout = this.currentLayout || GATHERING_STAGE_LAYOUTS[this.selectedBoss.id];
        const floor = layout && layout.platforms
            ? layout.platforms.find(p => p.w >= 700) || layout.platforms[0]
            : { x: 400, y: 500, w: 760, h: 10 };
        const floorTop = floor.y - floor.h / 2;
        const catY = floorTop - 15;

        // 床の上に配置
        this.cat = this.add.container(100, catY);
        this.catSprite = this.add.image(0, 0, 'cat').setScale(1.0);
        this.cat.add(this.catSprite);

        this.physics.world.enable(this.cat);
        this.cat.body.setSize(40, 30);
        this.cat.body.setOffset(-20, -15);
        this.cat.body.setCollideWorldBounds(true);
        this.cat.body.setMaxVelocity(600, 900);
        this.cat.body.setDragX(50);

        this.catState = {
            onGround: true,
            canWallKick: true,
            facing: 1
        };
    }

    createUI() {
        // タイマー表示
        this.timerText = this.add.text(400, 70, '0.00', {
            fontSize: '48px',
            color: '#ffd700',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(100);

        // 目標タイム表示
        this.add.text(400, 110, `目標: ${this.selectedBoss.targetTime.toFixed(2)}秒`, {
            fontSize: '20px',
            color: '#ff6666'
        }).setOrigin(0.5).setDepth(100);

        // 進捗表示
        this.progressText = this.add.text(780, 535, `0/${this.totalItems}`, {
            fontSize: '24px',
            color: '#88ff88',
            fontStyle: 'bold'
        }).setOrigin(1, 1).setDepth(100);

        // Mobile Controls
        if (DeviceDetector.isMobile()) {
            const controls = createMobileControls(this);
            this.joystick = controls.joystick;
            this.jumpBtn = controls.jumpBtn;
            updateMobileControlsForScreen(this.joystick, this.jumpBtn, this.cameras.main, this.scale.gameSize.width, this.scale.gameSize.height);
        }
    }

    setupInput() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys('W,A,S,D,SPACE');
    }

    setupCollisions() {
        this.physics.add.collider(this.cat, this.platforms);
        this.physics.add.collider(this.cat, this.walls);
        this.physics.add.overlap(this.cat, this.breakables, this.handleCatTouchItem, null, this);
        this.physics.add.collider(this.breakables, this.platforms, this.handleItemHitGround, null, this);
    }

    showCountdown() {
        const countdownText = this.add.text(400, 275, '3', {
            fontSize: '120px',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0.5).setDepth(200).setAlpha(0);

        let count = 3;
        const countInterval = this.time.addEvent({
            delay: 1000,
            repeat: 2,
            callback: () => {
                countdownText.setText(count.toString());
                countdownText.setAlpha(1).setScale(0.5);
                this.tweens.add({
                    targets: countdownText,
                    scale: 1.5,
                    alpha: 0,
                    duration: 900,
                    ease: 'Cubic.easeOut'
                });
                sound.tone(600, 0.1);
                count--;

                if (count === 0) {
                    this.time.delayedCall(1000, () => {
                        countdownText.setText('GO!');
                        countdownText.setAlpha(1).setScale(0.5);
                        this.tweens.add({
                            targets: countdownText,
                            scale: 2,
                            alpha: 0,
                            duration: 800,
                            ease: 'Cubic.easeOut',
                            onComplete: () => countdownText.destroy()
                        });
                        sound.tone(800, 0.15);
                        this.startTimer();
                    });
                }
            }
        });
    }

    startTimer() {
        this.startTime = this.time.now;
        this.isInitialized = true;
    }

    handleCatTouchItem(cat, item) {
        if (!item || !item.body) return;
        if (item.getData('isFalling') || item.getData('isBroken')) return;
        item.setData('isFalling', true);

        this.tweens.add({
            targets: item,
            angle: { from: -12, to: 12 },
            duration: 60,
            yoyo: true,
            repeat: 2,
            onComplete: () => {
                if (!item || !item.body || item.getData('isBroken')) return;
                item.body.setAllowGravity(true);
                item.body.setImmovable(false);
                item.body.setVelocity(
                    this.catState.facing * Phaser.Math.Between(20, 60),
                    -60
                );
                item.body.setAngularVelocity(Phaser.Math.Between(-300, 300));
            }
        });
    }

    handleItemHitGround(item, platform) {
        if (!item || !item.body) return;
        if (!item.getData('isFalling') || item.getData('isBroken')) return;
        item.setData('isBroken', true);

        const scoreValue = item.getData('scoreValue');
        this.score += scoreValue;
        this.brokenCount++;
        this.progressText.setText(`${this.brokenCount}/${this.totalItems}`);

        EnhancedParticles.createShards(this, item.x, item.y, 0x5bc0de, 10, scoreValue);
        sound.itemBreak(scoreValue / 80);

        item.destroy();

        // 全アイテム破壊でクリア
        if (this.brokenCount >= this.totalItems) {
            this.finishTimeAttack();
        }
    }

    update(time, delta) {
        if (!this.isInitialized || this.gameEnded) return;

        // タイマー更新
        if (this.startTime) {
            this.elapsedTime = (time - this.startTime) / 1000;
            this.timerText.setText(this.elapsedTime.toFixed(2));

            // 目標タイムを超えたら色変更
            if (this.elapsedTime > this.selectedBoss.targetTime) {
                this.timerText.setColor('#ff6666');
                // 制限時間超過でゲームオーバー
                this.triggerTimeOver();
                return;
            }
        }

        // プレイヤー操作
        this.handlePlayerInput();
        this.updateCatVisuals();
    }

    handlePlayerInput() {
        const body = this.cat.body;
        const onGround = body.blocked.down;
        const onWallL = body.blocked.left && !onGround;
        const onWallR = body.blocked.right && !onGround;

        if ((onWallL || onWallR) && body.velocity.y > 0) {
            body.setVelocityY(Math.min(body.velocity.y, 100));
        }

        const joystickDir = this.joystick ? this.joystick.getDirection() : { x: 0, y: 0 };
        const moveL = this.cursors.left.isDown || this.keys.A.isDown || joystickDir.x < -0.2;
        const moveR = this.cursors.right.isDown || this.keys.D.isDown || joystickDir.x > 0.2;

        if (moveL) {
            body.setVelocityX(-280);
            this.catState.facing = -1;
        } else if (moveR) {
            body.setVelocityX(280);
            this.catState.facing = 1;
        } else {
            body.setVelocityX(body.velocity.x * 0.85);
        }

        const jumpPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
            Phaser.Input.Keyboard.JustDown(this.keys.W) ||
            Phaser.Input.Keyboard.JustDown(this.keys.SPACE) ||
            (this.jumpBtn && this.jumpBtn.isPressed());

        if (jumpPressed) {
            if (onGround) {
                body.setVelocityY(-500);
                sound.jump();
                EnhancedParticles.createDustBurst(this, this.cat.x, this.cat.y + 15, 8, 'down');
            } else if (onWallL && this.catState.canWallKick) {
                body.setVelocity(400, -480);
                this.catState.facing = 1;
                this.executeWallKick();
            } else if (onWallR && this.catState.canWallKick) {
                body.setVelocity(-400, -480);
                this.catState.facing = -1;
                this.executeWallKick();
            }
        }

        this.catState.onGround = onGround;
    }

    executeWallKick() {
        this.catState.canWallKick = false;
        this.time.delayedCall(120, () => {
            this.catState.canWallKick = true;
        });
        sound.wallKick();
    }

    updateCatVisuals() {
        this.catSprite.setFlipX(this.catState.facing < 0);
    }

    triggerTimeOver() {
        if (this.gameEnded) return;
        this.gameEnded = true;

        this.time.delayedCall(500, () => {
            this.showResult(false, 'D'); // 敗北、ランクD
        });
    }

    finishTimeAttack() {
        if (this.gameEnded) return;
        this.gameEnded = true;

        const rules = new TimeAttackRules(this.selectedBoss.id);
        const isWin = rules.checkWin(this.elapsedTime);
        const rank = rules.getRank(this.elapsedTime);

        sound.clear();
        if (isWin) {
            sound.victoryMeow();
        }

        this.time.delayedCall(500, () => {
            this.showResult(isWin, rank);
        });
    }

    showResult(isWin, rank) {
        const overlay = this.add.rectangle(400, 275, 3000, 3000, 0x000000, 0)
            .setDepth(200);
        this.tweens.add({
            targets: overlay,
            fillAlpha: 0.85,
            duration: 400
        });

        this.time.delayedCall(300, () => {
            const c = this.add.container(400, 275)
                .setDepth(210)
                .setAlpha(0);

            if (isWin) {
                c.add(this.add.image(0, -120, 'celebrate').setScale(1.2));
                c.add(this.add.text(0, -50, '勝利！', {
                    fontSize: '48px',
                    color: '#44ff44',
                    fontStyle: 'bold',
                    stroke: '#000',
                    strokeThickness: 4
                }).setOrigin(0.5));

                // ランク表示
                c.add(this.add.text(0, 10, `ランク: ${rank}`, {
                    fontSize: '36px',
                    color: '#ffd700',
                    fontStyle: 'bold'
                }).setOrigin(0.5));
            } else {
                c.add(this.add.image(0, -120, 'shock').setScale(1.2));
                c.add(this.add.text(0, -50, '失敗', {
                    fontSize: '48px',
                    color: '#ff5555',
                    fontStyle: 'bold',
                    stroke: '#000',
                    strokeThickness: 4
                }).setOrigin(0.5));
            }

            // タイム表示
            c.add(this.add.text(-100, 60, 'あなた:', { fontSize: '18px', color: '#aaa' }).setOrigin(0, 0.5));
            c.add(this.add.text(100, 60, `${this.elapsedTime.toFixed(2)}秒`, {
                fontSize: '18px',
                color: isWin ? '#88ff88' : '#ff8888'
            }).setOrigin(1, 0.5));

            c.add(this.add.text(-100, 90, `${this.selectedBoss.name}:`, { fontSize: '18px', color: '#aaa' }).setOrigin(0, 0.5));
            c.add(this.add.text(100, 90, `${this.selectedBoss.targetTime.toFixed(2)}秒`, {
                fontSize: '18px',
                color: '#ffdd88'
            }).setOrigin(1, 0.5));

            const diff = Math.abs(this.elapsedTime - this.selectedBoss.targetTime);
            const diffText = this.elapsedTime < this.selectedBoss.targetTime ? `-${diff.toFixed(2)}秒` : `+${diff.toFixed(2)}秒`;
            c.add(this.add.text(0, 120, diffText, {
                fontSize: '20px',
                color: isWin ? '#88ff88' : '#ff8888',
                fontStyle: 'bold'
            }).setOrigin(0.5));

            // ボタン
            const makeBtn = (y, txt, cb) => {
                const bg = this.add.rectangle(0, y, 200, 45, 0x4a4a8a)
                    .setStrokeStyle(2, 0x7a7aba)
                    .setInteractive({ useHandCursor: true });
                const tx = this.add.text(0, y, txt, { fontSize: '18px', color: '#fff' }).setOrigin(0.5);
                bg.on('pointerover', () => bg.setFillStyle(0x6a6aaa));
                bg.on('pointerout', () => bg.setFillStyle(0x4a4a8a));
                bg.on('pointerdown', () => {
                    sound.tone(440, 0.1);
                    cb();
                });
                return [bg, tx];
            };

            c.add(makeBtn(170, 'もういちど', () => {
                this.children.removeAll(true);
                this.isInitialized = false;
                this.showBossSelection();
            }));
            c.add(makeBtn(220, 'タイトルへ', () => {
                this.scene.start('TitleScene');
            }));

            this.tweens.add({
                targets: c,
                alpha: 1,
                y: 265, // H/2 - 10 -> 275 - 10
                duration: 350,
                ease: 'Back.easeOut'
            });
        });
    }

    shutdown() {
        // Remove resize listener
        this.scale.off('resize', this.handleResize, this);

        // Destroy mobile controls if they exist
        if (this.joystick) {
            this.joystick.destroy();
            this.joystick = null;
        }
        if (this.jumpBtn) {
            this.jumpBtn.destroy();
            this.jumpBtn = null;
        }
    }
}
