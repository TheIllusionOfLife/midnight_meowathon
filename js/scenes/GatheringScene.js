// 猫の集会シーン - タイムアタック形式
class GatheringScene extends Phaser.Scene {
    static HIGHSCORE_KEY = 'cat_zoomies_gathering_times';

    constructor() {
        super('GatheringScene');
    }

    loadBestTimes() {
        try {
            const data = localStorage.getItem(GatheringScene.HIGHSCORE_KEY);
            return data ? JSON.parse(data) : {};
        } catch (e) { return {}; }
    }

    saveBestTime(bossId, time) {
        try {
            const times = this.loadBestTimes();
            if (!times[bossId] || time < times[bossId]) {
                times[bossId] = time;
                localStorage.setItem(GatheringScene.HIGHSCORE_KEY, JSON.stringify(times));
                return true;
            }
            return false;
        } catch (e) { return false; }
    }

    getBestTime(bossId) {
        return this.loadBestTimes()[bossId] || null;
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
        this.isTransitioning = false; // Prevent selecting multiple bosses during transition
        this.physics.world.setBounds(0, 0, 800, 550);

        // ボス選択画面
        this.showBossSelection();
    }

    handleResize(gameSize) {
        // Update GameLayout
        GameLayout.init(this);

        if (!this.selectedBoss) {
            // In Boss Selection Screen - Rebuild UI
            this.cleanupMobileControls();
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
            this.physics.world.setBounds(0, 0, worldW, worldH);

            const zoomX = screenW / worldW;
            const zoomY = screenH / worldH;
            const isLandscape = screenW > screenH;
            const baseZoom = Math.min(zoomX, zoomY, 1);
            const zoomPadding = (DeviceDetector.isMobile() && isLandscape) ? 0.85 : 1;
            const zoom = baseZoom * zoomPadding;

            this.cameras.main.setZoom(zoom);
            this.cameras.main.removeBounds();
            const visibleH = screenH / zoom;
            const minCenterY = worldH / 2;
            const bottomPadding = (DeviceDetector.isMobile() && isLandscape) ? 24 : 0;
            const centerY = Math.max(minCenterY, worldH - visibleH / 2 + bottomPadding);
            this.cameras.main.centerOn(worldW / 2, centerY);

            // Update UI camera size (controls manage their own positioning)
            if (this.uiCamera) {
                this.uiCamera.setSize(screenW, screenH);
            }
        }
    }

    showBossSelection() {
        const W = GameLayout.W;
        const H = GameLayout.H;

        // Reset transition flag
        this.isTransitioning = false;

        // 背景
        const gfx = this.add.graphics();
        gfx.fillGradientStyle(0x0a0a18, 0x0a0a18, 0x12122a, 0x12122a);
        gfx.fillRect(0, 0, W, H);

        // タイトル
        const titleSize = GameLayout.fontSize(36) + 'px';
        this.add.text(W / 2, H * 0.08, i18n.t('GATHERING_TITLE'), {
            fontSize: titleSize,
            fontFamily: 'Kosugi Maru',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#2a2a5a',
            strokeThickness: 6
        }).setOrigin(0.5);

        this.add.text(W / 2, H * 0.14, i18n.t('GATHERING_SELECT'), {
            fontSize: GameLayout.fontSize(20) + 'px',
            fontFamily: 'Kosugi Maru',
            color: '#aaaacc'
        }).setOrigin(0.5);

        // ボス猫カード - Responsive Layout
        if (GameLayout.isPortrait) {
            // 2x2 Grid - calculate scale to fill available space
            // Available vertical space: from H*0.18 (below subtitle) to H*0.85 (above back button)
            const availableHeight = H * 0.65; // 85% - 20% = 65% of screen
            const availableWidth = W * 0.9; // 90% of screen width

            // Card base size is 160x220, we need 2 columns and 2 rows with gaps
            const gapRatio = 0.08; // 8% gap between cards
            const maxCardWidth = availableWidth / (2 + gapRatio);
            const maxCardHeight = availableHeight / (2 + gapRatio);

            // Scale based on whichever dimension is more constrained
            const scaleByWidth = maxCardWidth / 160;
            const scaleByHeight = maxCardHeight / 220;
            const cardScale = Math.min(scaleByWidth, scaleByHeight, 1.0); // Cap at 1.0

            const cardWidth = 160 * cardScale;
            const cardHeight = 220 * cardScale;
            const gapX = cardWidth * gapRatio;
            const gapY = cardHeight * gapRatio;

            // Center the grid both horizontally and vertically
            const totalGridWidth = cardWidth * 2 + gapX;
            const totalGridHeight = cardHeight * 2 + gapY;
            const startX = (W - totalGridWidth) / 2 + cardWidth / 2;
            const verticalCenter = H * 0.18 + (H * 0.67) / 2; // Center between subtitle and back button
            const startY = verticalCenter - totalGridHeight / 2 + cardHeight / 2;

            BOSS_CATS.forEach((boss, index) => {
                const col = index % 2;
                const row = Math.floor(index / 2);
                const cx = startX + col * (cardWidth + gapX);
                const cy = startY + row * (cardHeight + gapY);
                this.createBossCard(boss, cx, cy, cardScale);
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

        const backText = this.add.text(W / 2, btnY, i18n.t('BTN_TO_TITLE'), {
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
        const name = this.add.text(0, -15, boss.getName(), {
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
        const desc = this.add.text(0, 50, boss.getDescription(), {
            fontSize: '11px',
            color: '#ddddee',
            align: 'center',
            lineSpacing: 2,
            wordWrap: { width: 140 }
        }).setOrigin(0.5);

        // ベストタイム表示
        const bestTime = this.getBestTime(boss.id);
        const bestText = bestTime !== null
            ? i18n.t('GATHERING_BEST').replace('{0}', bestTime.toFixed(2))
            : i18n.t('GATHERING_BEST_NONE');
        const best = this.add.text(0, 90, bestText, {
            fontSize: '10px',
            color: bestTime !== null ? '#ffdd66' : '#888888',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        container.add([card, catIcon, name, difficulty, desc, best]);

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
            // Prevent selecting multiple bosses during transition
            if (this.isTransitioning) return;
            this.isTransitioning = true;

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
            this.cleanupMobileControls();
            this.children.removeAll(true);
            this.initTimeAttack();
            // 黒画面修正：カメラをフェードイン
            this.cameras.main.fadeIn(300);
        });
    }

    cleanupMobileControls() {
        this.autoIgnoreNewChildren = false;
        if (this.joystick) {
            this.joystick.destroy();
            this.joystick = null;
        }
        if (this.jumpBtn) {
            this.jumpBtn.destroy();
            this.jumpBtn = null;
        }
        if (this.uiCamera) {
            this.cameras.remove(this.uiCamera);
            this.uiCamera = null;
        }
        this.controlObjects = null;
    }

    // Helper to run effects and auto-ignore new children from UI camera
    runEffect(effectFn) {
        if (!this.autoIgnoreNewChildren || !this.uiCamera) {
            effectFn();
            return;
        }
        const childrenBefore = new Set(this.children.list);
        effectFn();
        this.children.list.forEach(child => {
            if (!childrenBefore.has(child) && !this.controlObjects?.has(child)) {
                this.uiCamera.ignore(child);
            }
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
        this.add.text(400, 30, layout.getName(), {
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
        this.handleResize(this.scale.gameSize);

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
        const isMobile = DeviceDetector.isMobile();
        if (isMobile) {
            this.cleanupMobileControls();
        }
        // タイマー表示
        this.timerText = this.add.text(400, 70, '0.00', {
            fontSize: '48px',
            color: '#ffd700',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(100);

        // 目標タイム表示
        this.add.text(400, 110, i18n.t('GATHERING_TARGET').replace('{0}', this.selectedBoss.targetTime.toFixed(2)), {
            fontSize: '20px',
            color: '#ff6666'
        }).setOrigin(0.5).setDepth(100);

        // 進捗表示
        this.progressText = this.add.text(780, 535, `0/${this.totalItems}`, {
            fontSize: '24px',
            color: '#88ff88',
            fontStyle: 'bold'
        }).setOrigin(1, 1).setDepth(100);

        // Mobile Controls - use separate UI camera (no zoom) like HUDScene
        if (isMobile) {
            // Create UI camera that won't be zoomed (transparent, only for controls)
            this.uiCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height);
            this.uiCamera.setScroll(0, 0);
            this.uiCamera.transparent = true;

            // Create controls with default positioning (like HUDScene)
            const controls = createMobileControls(this);
            this.joystick = controls.joystick;
            this.jumpBtn = controls.jumpBtn;

            // Collect all control objects in a Set for fast lookup
            this.controlObjects = new Set([
                this.joystick.base, this.joystick.stick,
                this.jumpBtn.button, this.jumpBtn.icon
            ]);

            // Main camera ignores controls (won't be affected by zoom)
            this.controlObjects.forEach(obj => {
                if (obj) this.cameras.main.ignore(obj);
            });

            // UI camera ignores everything except controls
            this.children.each(child => {
                if (!this.controlObjects.has(child)) {
                    this.uiCamera.ignore(child);
                }
            });

            // Store reference for ignoring new children added later (particles, effects, etc.)
            this.autoIgnoreNewChildren = true;
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

        // Make UI camera ignore countdown (prevent duplicate rendering)
        if (this.uiCamera) {
            this.uiCamera.ignore(countdownText);
        }

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

        this.runEffect(() => EnhancedParticles.createShards(this, item.x, item.y, 0x5bc0de, 10, scoreValue));
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
                this.runEffect(() => EnhancedParticles.createDustBurst(this, this.cat.x, this.cat.y + 15, 8, 'down'));
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

        // 勝利時にベストタイムを保存
        let isNewRecord = false;
        if (isWin) {
            isNewRecord = this.saveBestTime(this.selectedBoss.id, this.elapsedTime);
        }

        sound.clear();
        if (isWin) {
            sound.victoryMeow();
        }

        this.time.delayedCall(500, () => {
            this.showResult(isWin, rank, isNewRecord);
        });
    }

    showResult(isWin, rank, isNewRecord = false) {
        sound.stopAll();
        const overlay = this.add.rectangle(400, 275, 3000, 3000, 0x000000, 0)
            .setDepth(200);

        // Make UI camera ignore the overlay (prevent duplicate rendering)
        if (this.uiCamera) {
            this.uiCamera.ignore(overlay);
        }

        this.tweens.add({
            targets: overlay,
            fillAlpha: 0.85,
            duration: 400
        });

        this.time.delayedCall(300, () => {
            const c = this.add.container(400, 275)
                .setDepth(210)
                .setAlpha(0);

            // Make UI camera ignore the result container (prevent duplicate rendering)
            if (this.uiCamera) {
                this.uiCamera.ignore(c);
            }

            if (isWin) {
                c.add(this.add.image(0, -120, 'celebrate').setScale(1.2));
                c.add(this.add.text(0, -50, i18n.t('GATHERING_VICTORY'), {
                    fontSize: '48px',
                    color: '#44ff44',
                    fontStyle: 'bold',
                    stroke: '#000',
                    strokeThickness: 4
                }).setOrigin(0.5));

                // ランク表示
                c.add(this.add.text(0, 10, i18n.t('GATHERING_RANK').replace('{0}', rank), {
                    fontSize: '36px',
                    color: '#ffd700',
                    fontStyle: 'bold'
                }).setOrigin(0.5));

                // 新記録表示
                if (isNewRecord) {
                    c.add(this.add.text(0, 50, i18n.t('GATHERING_NEW_RECORD'), {
                        fontSize: '24px',
                        color: '#ff66ff',
                        fontStyle: 'bold',
                        stroke: '#000',
                        strokeThickness: 3
                    }).setOrigin(0.5));
                }
            } else {
                c.add(this.add.image(0, -120, 'shock').setScale(1.2));
                c.add(this.add.text(0, -50, i18n.t('GATHERING_DEFEAT'), {
                    fontSize: '48px',
                    color: '#ff5555',
                    fontStyle: 'bold',
                    stroke: '#000',
                    strokeThickness: 4
                }).setOrigin(0.5));
            }

            // タイム表示
            c.add(this.add.text(-100, 60, i18n.t('GATHERING_YOU'), { fontSize: '18px', color: '#aaa' }).setOrigin(0, 0.5));
            c.add(this.add.text(100, 60, `${this.elapsedTime.toFixed(2)}${i18n.t('GATHERING_TIME_UNIT')}`, {
                fontSize: '18px',
                color: isWin ? '#88ff88' : '#ff8888'
            }).setOrigin(1, 0.5));

            c.add(this.add.text(-100, 90, `${this.selectedBoss.getName()}:`, { fontSize: '18px', color: '#aaa' }).setOrigin(0, 0.5));
            c.add(this.add.text(100, 90, `${this.selectedBoss.targetTime.toFixed(2)}${i18n.t('GATHERING_TIME_UNIT')}`, {
                fontSize: '18px',
                color: '#ffdd88'
            }).setOrigin(1, 0.5));

            const diff = Math.abs(this.elapsedTime - this.selectedBoss.targetTime);
            const diffText = this.elapsedTime < this.selectedBoss.targetTime ? `-${diff.toFixed(2)}${i18n.t('GATHERING_TIME_UNIT')}` : `+${diff.toFixed(2)}${i18n.t('GATHERING_TIME_UNIT')}`;
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

            c.add(makeBtn(160, i18n.t('BTN_AGAIN'), () => {
                this.cleanupMobileControls();
                this.children.removeAll(true);
                this.isInitialized = false;
                this.selectedBoss = null; // Reset so resize handler knows we're in selection screen
                this.cameras.main.setZoom(1); // Reset zoom
                this.showBossSelection();
            }));
            c.add(makeBtn(230, i18n.t('BTN_TO_TITLE'), () => {
                this.cleanupMobileControls();
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

        this.cleanupMobileControls();
    }
}
