// メインゲームシーン（ローグライト要素統合版）

// Game constants (module-level for broader browser compatibility)
const GAME_CONSTANTS = {
    WORLD_WIDTH: 800,
    WORLD_HEIGHT: 550,
    PLAYER_DRAG: 50,
    PLAYER_JUMP_FORCE: 500,
    PLAYER_BASE_SPEED: 280,
    WALL_SLIDE_SPEED: 100,
    MAX_NOISE: 100,
    BASE_COMBO_TIMER: 80,
    SLOW_MO_DURATION: 25,
    SLOW_MO_TIME_SCALE: 2.5
};

class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        // Initialize responsive layout
        GameLayout.init(this);

        // ゲーム状態初期化
        this.score = 0;
        this.noise = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.comboTimer = 0;
        this.timeLeft = 90; // Will be overridden by stage layout
        this.gameEnded = false;
        this.slowMoTimer = 0;
        this.shakeIntensity = 0;
        this.brokenCount = 0;
        this.catExpression = 'cat';
        this.lastJumpPressed = false;
        this.catComfyStunned = false;
        this.lastBreakTime = 0;

        // 猫の状態
        this.catState = {
            onGround: true,
            onWallL: false,
            onWallR: false,
            canWallKick: true,
            facing: 1,
            hasDoubleJump: powerUpManager.hasEffect('doubleJump'),
            doubleJumpUsed: false
        };

        // 物理グループ
        this.platforms = this.physics.add.staticGroup();
        this.walls = this.physics.add.staticGroup();
        this.breakables = this.physics.add.group({ allowGravity: false });

        // 固定ワールド境界を設定（画面サイズ変更の影響を受けない）
        this.physics.world.setBounds(0, 0, GAME_CONSTANTS.WORLD_WIDTH, GAME_CONSTANTS.WORLD_HEIGHT);

        // シーン構築
        this.createBackground();
        this.createRoom();
        this.createAtmosphere();
        this.createCat();

        // Launch HUD Scene & remove local UI
        this.scene.launch('HUDScene', { mainScene: this });
        this.hud = this.scene.get('HUDScene');

        this.setupInput();
        this.setupCollisions();
        this.startGameTimer();

        // Listen for resize to update camera
        this.scale.on('resize', this.handleResize, this);

        // Apply initial camera zoom/centering
        this.handleResize(this.scale.gameSize);

        this.cameras.main.fadeIn(300);
    }

    handleResize(gameSize) {
        const screenW = gameSize.width;
        const screenH = gameSize.height;

        // Keep physics bounds fixed to game world
        this.physics.world.setBounds(0, 0, GAME_CONSTANTS.WORLD_WIDTH, GAME_CONSTANTS.WORLD_HEIGHT);

        // Fixed game world dimensions
        const worldW = GAME_CONSTANTS.WORLD_WIDTH;  // 800
        const worldH = GAME_CONSTANTS.WORLD_HEIGHT; // 550

        // Calculate zoom to fit the entire game world in the screen
        const zoomX = screenW / worldW;
        const zoomY = screenH / worldH;
        const zoom = Math.min(zoomX, zoomY);

        // Store base zoom for slow-motion effects
        this.baseZoom = zoom;
        this.cameras.main.setZoom(zoom);

        // Remove camera bounds to allow viewing beyond world edges
        this.cameras.main.removeBounds();

        // Use Phaser's centerOn to center the camera on the middle of the game world
        // This ensures the entire 800x550 world is visible and centered
        const worldCenterX = worldW / 2;  // 400
        const worldCenterY = worldH / 2;  // 275

        this.cameras.main.centerOn(worldCenterX, worldCenterY);

        // Store base scroll for effects (centerOn sets scroll internally)
        this.baseScrollX = this.cameras.main.scrollX;
        this.baseScrollY = this.cameras.main.scrollY;
    }

    createBackground() {
        // Huge Background to cover all aspect ratios/zooms
        // Center at world center, but make it massive
        const bgW = 4000;
        const bgH = 4000;

        // Tiled Background Pattern (Wallpaper)
        this.add.tileSprite(W / 2, H / 2, bgW, bgH, 'bg_pattern')
            .setScrollFactor(0.2) // Parallax effect
            .setTint(0x8888aa);

        // Gradients removed - was causing dark artifact on mobile
        // Vignette effect will be recreated in createAtmosphere instead

        // パララックス背景（3層）
        // 遠景 - 建物シルエット
        for (let i = 0; i < 5; i++) {
            const building = this.add.rectangle(
                i * 180 + 50,
                H - 100,
                80 + Math.random() * 40,
                100 + Math.random() * 80,
                0x0a0a15,
                0.3
            ).setOrigin(0.5, 1).setDepth(-2).setScrollFactor(0.1);
        }

        // 中景 - 壁紙パターン
        for (let x = 0; x < W; x += 50) {
            for (let y = 0; y < H - 70; y += 50) {
                this.add.rectangle(x + 25, y + 25, 48, 48, 0x16162a, 0.4)
                    .setDepth(-1)
                    .setScrollFactor(0.3);
            }
        }

        // 窓（パララックス対応）
        const windowX = GameLayout.isPortrait ? 600 : 680;
        const windowY = 120;
        this.windowX = windowX;
        this.windowY = windowY;
        this.add.rectangle(windowX, windowY, 100, 150, 0x1a1a30)
            .setStrokeStyle(6, 0x3a3a5a)
            .setDepth(0)
            .setScrollFactor(0.5);
        this.add.rectangle(windowX, windowY, 85, 135, 0x080818)
            .setDepth(0)
            .setScrollFactor(0.5);
        this.add.image(windowX + 20, windowY - 25, 'moon').setScale(0.5)
            .setDepth(0)
            .setScrollFactor(0.5);

        // 星（窓の外）
        for (let i = 0; i < 5; i++) {
            this.add.circle(
                windowX - 30 + Math.random() * 60,
                windowY - 40 + Math.random() * 80,
                1,
                0xffffff,
                0.5
            ).setDepth(0).setScrollFactor(0.5);
        }

        this.add.rectangle(windowX, windowY, 4, 135, 0x3a3a5a).setDepth(0).setScrollFactor(0.5);
        this.add.rectangle(windowX, windowY, 85, 4, 0x3a3a5a).setDepth(0).setScrollFactor(0.5);
        this.add.rectangle(windowX - 60, windowY, 20, 155, 0x5a3a6a, 0.7).setDepth(0).setScrollFactor(0.5);
        this.add.rectangle(windowX + 60, windowY, 20, 155, 0x5a3a6a, 0.7).setDepth(0).setScrollFactor(0.5);

        // 床
        this.add.rectangle(W / 2, H - 30, W, 60, 0x2a2520);
        for (let x = 0; x < W; x += 80) {
            this.add.rectangle(x + 40, H - 30, 78, 58, 0x352a20, 0.5);
        }
    }



    createAtmosphere() {
        // Moonlight Beams (from Window)
        const windowX = typeof this.windowX === 'number' ? this.windowX : 680;
        const windowY = typeof this.windowY === 'number' ? this.windowY : 120;
        const light = this.add.graphics();
        light.fillStyle(0xffffcc, 0.08); // Very subtle warm white
        light.beginPath();
        light.moveTo(windowX, windowY); // Window center
        light.lineTo(windowX - 50, windowY);
        light.lineTo(windowX - 180, H);
        light.lineTo(windowX + 120, H);
        light.closePath();
        light.fillPath();
        light.setDepth(10); // In front of background, behind gameplay
        light.setScrollFactor(0.2); // Parallax effect

        // Ambient Dust Particles
        // If 'dust' doesn't exist, Create it on the fly
        if (!this.textures.exists('dust')) {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            g.fillStyle(0xffffff);
            g.fillCircle(2, 2, 2);
            g.generateTexture('dust', 4, 4);
            g.destroy();
        }

        const emitter = this.add.particles(0, 0, 'dust', {
            x: { min: 0, max: W },
            y: { min: 0, max: H },
            lifespan: 8000,
            speedY: { min: 5, max: 15 },
            speedX: { min: -5, max: 5 },
            scale: { start: 0.2, end: 0.5 },
            alpha: { start: 0, mid: 0.3, end: 0 },
            quantity: 1,
            frequency: 500,
            blendMode: 'ADD'
        });
        emitter.setScrollFactor(0);
        emitter.setDepth(150); // Overlay on top

        // Vignette Overlay removed - was potentially obscuring floor area on mobile
        // const vignette = this.add.graphics();
        // vignette.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0.8, 0.8, 0, 0);
        // vignette.fillRect(0, 0, W, 150); // Top fade
        // vignette.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0, 0, 0.8, 0.8);
        // vignette.fillRect(0, H - 150, W, 150); // Bottom fade 
        // vignette.setDepth(200);
        // vignette.setScrollFactor(0);
    }

    getCurrentStageLayout() {
        const stageNum = storyProgress.getCurrentStage();
        let layout = STAGE_LAYOUTS[stageNum];

        if (!layout) {
            console.error(`Stage ${stageNum} not found, falling back to stage 1`);
            layout = STAGE_LAYOUTS[1];
            if (!layout) {
                throw new Error('No stage layouts available');
            }
        }
        return layout;
    }

    createRoom() {
        const layout = this.getCurrentStageLayout();

        // Set time limit from layout
        this.timeLeft = layout.timeLimit || 90;

        // 壁と床
        this.addWall(8, H / 2, 16, H);
        this.addWall(W - 8, H / 2, 16, H);
        this.addPlatform(W / 2, H - 5, W - 20, 10, 0x3a3530);

        // ステージ名表示（一時的）
        const stageNameText = this.add.text(GameLayout.W / 2, GameLayout.pctY(0.12), layout.getName(), {
            fontSize: GameLayout.fontSize(24) + 'px',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: GameLayout.scale(4)
        }).setOrigin(0.5).setDepth(250).setScrollFactor(0).setAlpha(0);

        this.tweens.add({
            targets: stageNameText,
            alpha: 1,
            duration: 500,
            hold: 2000,
            yoyo: true,
            onComplete: () => stageNameText.destroy()
        });

        // プラットフォーム配置
        layout.platforms.forEach(p => {
            const platform = this.addPlatform(p.x, p.y, p.w, p.h, p.color);
            if (p.bouncy) {
                platform.setData('isBouncy', true);
            }
            if (p.comfy) {
                platform.setData('comfy', true);
            }
            if (p.crumbling) {
                platform.setData('crumbling', true);
                platform.setData('landCount', 0);
            }
        });

        // ソフトゾーン（畳）配置
        if (layout.softZones) {
            this.softZones = layout.softZones.map(zone => {
                const rect = this.add.rectangle(zone.x, zone.y, zone.w, zone.h, 0x88cc88, 0.1)
                    .setDepth(1);
                return { ...zone, sprite: rect };
            });
        } else {
            this.softZones = [];
        }

        // スローゾーン（蜘蛛の巣）配置
        if (layout.slowZones) {
            this.slowZones = layout.slowZones.map(zone => {
                const rect = this.add.rectangle(zone.x, zone.y, zone.w, zone.h, 0xcccccc, 0.15)
                    .setDepth(1);
                return { ...zone, sprite: rect };
            });
        } else {
            this.slowZones = [];
        }

        // ムーンビーム作成
        this.createMoonbeam();

        // アイテム配置
        layout.items.forEach(item => {
            this.spawnBreakable(item.x, item.y, item.type, item.scale);
        });

        this.totalBreakables = this.breakables.getChildren().length;
    }

    addPlatform(x, y, w, h, color) {
        const p = this.add.rectangle(x, y, w, h, color);
        this.physics.add.existing(p, true);
        this.platforms.add(p);
        return p;
    }

    addWall(x, y, w, h) {
        // Visible wall to hint wall-kick
        this.add.rectangle(x, y, w, h, 0x2a2a44, 0.6)
            .setDepth(5);

        const wall = this.add.rectangle(x, y, w, h, 0x101015, 0);
        this.physics.add.existing(wall, true);
        this.walls.add(wall);
    }

    createMoonbeam() {
        const layout = this.getCurrentStageLayout();
        if (!layout.moonbeam) return;

        const mb = layout.moonbeam;
        this.moonbeam = this.add.rectangle(mb.startX, 275, mb.width, 550, 0xffffcc, 0.15)
            .setDepth(15);

        this.tweens.add({
            targets: this.moonbeam,
            x: mb.endX,
            duration: mb.cycleTime,
            yoyo: true,
            repeat: -1,
            ease: 'Linear'
        });
    }

    isInSoftZone(x, y) {
        if (!this.softZones || this.softZones.length === 0) return false;
        return this.softZones.some(zone => {
            return Math.abs(x - zone.x) < zone.w / 2 && Math.abs(y - zone.y) < zone.h / 2;
        });
    }

    isInSlowZone(x, y) {
        if (!this.slowZones || this.slowZones.length === 0) return false;
        return this.slowZones.some(zone => {
            return Math.abs(x - zone.x) < zone.w / 2 && Math.abs(y - zone.y) < zone.h / 2;
        });
    }

    isInMoonbeam(x, y) {
        if (!this.moonbeam) return false;
        const mb = this.moonbeam;
        return Math.abs(x - mb.x) < mb.width / 2 && Math.abs(y - mb.y) < mb.height / 2;
    }

    collapsePlatform(platform) {
        if (!platform || platform.getData('collapsed')) return;
        platform.setData('collapsed', true);

        // Items on platform fall with it
        const platformBounds = platform.getBounds();
        this.breakables.getChildren().forEach(item => {
            if (item.getData('isBroken')) return;
            const itemBounds = item.getBounds();
            if (Phaser.Geom.Intersects.RectangleToRectangle(platformBounds, itemBounds)) {
                if (!item.getData('isFalling')) {
                    item.setData('isFalling', true);
                    item.body.setAllowGravity(true);
                    item.body.setImmovable(false);
                    item.body.setVelocity(
                        Phaser.Math.Between(-30, 30),
                        50
                    );
                }
            }
        });

        // Platform falls
        this.tweens.add({
            targets: platform,
            y: platform.y + 600,
            alpha: 0,
            duration: 1500,
            ease: 'Cubic.easeIn',
            onComplete: () => {
                platform.destroy();
            }
        });

        this.shakeIntensity = 6;
        sound.tone(120, 0.3, 'sawtooth');
    }

    spawnBreakable(x, y, type, scale) {
        const itemProps = ITEM_PROPERTIES[type] || { score: 50, noise: 8 };

        const sprite = this.physics.add.sprite(x, y, type).setScale(scale);
        sprite.body.setAllowGravity(false);
        sprite.body.setImmovable(true);
        sprite.setData('type', type);
        sprite.setData('scoreValue', itemProps.score);
        sprite.setData('noiseValue', itemProps.noise);
        sprite.setData('isFalling', false);
        sprite.setData('isBroken', false);
        this.breakables.add(sprite);
    }

    createCat() {
        const layout = this.getCurrentStageLayout();

        this.cat = this.add.container(layout.catStart.x, layout.catStart.y);
        this.catSprite = this.add.sprite(0, 0, 'cat').setScale(1.0);
        this.cat.add(this.catSprite);

        // アニメーション定義
        if (!this.anims.exists('catWalk')) {
            this.anims.create({
                key: 'catWalk',
                frames: [
                    { key: 'catWalk1' },
                    { key: 'cat' }, // 中間ポーズとして通常を入れる
                    { key: 'catWalk2' },
                    { key: 'cat' }
                ],
                frameRate: 8,
                repeat: -1
            });
        }

        this.physics.world.enable(this.cat);
        this.cat.body.setSize(40, 30);
        this.cat.body.setOffset(-20, -15);
        this.cat.body.setCollideWorldBounds(true);
        this.cat.body.setMaxVelocity(600, 900);

        // ローグライト: ドラッグ調整
        const dragMult = powerUpManager.getMultiplier('dragMultiplier');
        this.cat.body.setDragX(50 * dragMult);

        // ローグライト: 重力調整
        const gravityMult = powerUpManager.getMultiplier('gravityMultiplier');
        if (gravityMult !== 1.0) {
            this.cat.body.setGravityY(1100 * (gravityMult - 1));
        }
    }

    updateOwnerMonitor() {
        // Emit event to HUDScene
        this.events.emit('updateNoise', this.noise);
    }

    updateCatVisuals(time) {
        if (!this.catSprite) return;

        const body = this.cat.body;
        const onGround = body.blocked.down;
        const speedX = Math.abs(body.velocity.x);
        const speedY = body.velocity.y;

        // 向きの更新
        this.catSprite.setFlipX(this.catState.facing < 0);

        // 表情が指定されている場合はそれを優先
        if (this.catExpression && this.catExpression !== 'cat') {
            this.catSprite.setTexture(this.catExpression);
            this.catSprite.stop();
            return;
        }

        // 状態によるアニメーション
        if (!onGround) {
            // 空中
            if (this.catState.onWallL || this.catState.onWallR) {
                this.catSprite.setTexture('catWall');
            } else if (speedY < -50) {
                // 上昇中
                this.catSprite.setTexture('catJump');
            } else if (speedY > 300) {
                this.catSprite.setTexture('catLand'); // 着地準備で少し潰れる
            } else {
                this.catSprite.setTexture('cat'); // 通常落下
            }
            this.catSprite.stop();
            this.catSprite.setAngle(0);
        } else {
            // 地上
            if (speedX > 30) {
                // 移動中
                if (!this.catSprite.anims.isPlaying || this.catSprite.anims.currentAnim.key !== 'catWalk') {
                    this.catSprite.play('catWalk');
                }
            } else {
                // 停止中（呼吸アニメーション付き）
                this.catSprite.setTexture('cat');
                this.catSprite.stop();
            }
            // 地上での呼吸アニメーション
            this.catSprite.setAngle(Math.sin(time / 120) * 3);
        }
    }

    setupInput() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys('W,A,S,D,SPACE,E');

        // 雷の発動（Eキー）
        if (powerUpManager.hasPowerUp('thunder')) {
            this.keys.E.on('down', () => {
                this.activateThunder();
            });
        }
    }

    setupCollisions() {
        this.physics.add.collider(this.cat, this.platforms, this.handleCatLand, null, this);
        this.physics.add.collider(this.cat, this.walls);
        this.physics.add.overlap(this.cat, this.breakables, this.handleCatTouchItem, null, this);
        this.physics.add.collider(this.breakables, this.platforms, this.handleItemHitGround, null, this);
    }

    handleCatLand(cat, platform) {
        if (!this.catState.onGround && cat.body.velocity.y >= 0 && cat.body.blocked.down) {
            const fallSpeed = Math.abs(cat.body.velocity.y);
            this.addNoise(fallSpeed > 400 ? 4 : 2);
            sound.land();
            EnhancedParticles.createDustBurst(this, cat.x, cat.y + 15, 8, 'down');
            this.tweens.add({
                targets: this.catSprite,
                scaleY: 0.8,
                scaleX: 1.2,
                duration: 50,
                yoyo: true
            });

            // 二段ジャンプリセット
            this.catState.doubleJumpUsed = false;

            // Comfy trap (kotatsu)
            if (platform.getData('comfy') && !this.catComfyStunned) {
                this.catComfyStunned = true;
                this.cat.body.setVelocity(0, 0);
                this.changeCatExpression('catHappy');
                sound.tone(440, 0.2);
                showCatDialogue(this, cat.x, cat.y, 'jump');
                this.time.delayedCall(1500, () => {
                    this.catComfyStunned = false;
                    this.changeCatExpression('cat');
                });
            }

            // Crumbling platform
            if (platform.getData('crumbling')) {
                const landCount = (platform.getData('landCount') || 0) + 1;
                platform.setData('landCount', landCount);

                if (landCount === 1) {
                    // First landing: shake warning
                    this.tweens.add({
                        targets: platform,
                        x: platform.x + 3,
                        yoyo: true,
                        repeat: 5,
                        duration: 50
                    });
                    sound.tone(200, 0.1);
                } else if (landCount >= 2) {
                    // Second landing: collapse after delay
                    this.time.delayedCall(2000, () => this.collapsePlatform(platform));
                }
            }

            // Bouncy platform
            if (platform.getData('isBouncy')) {
                const jumpMult = powerUpManager.getMultiplier('jumpMultiplier');
                cat.body.setVelocityY(-450 * jumpMult);
                sound.jump();
                showCatDialogue(this, cat.x, cat.y, 'jump');
            }
        }
    }

    handleCatTouchItem(cat, item) {
        if (!item || !item.body) return;
        if (item.getData('isFalling') || item.getData('isBroken')) return;
        item.setData('isFalling', true);

        // Check if item is rolling type (canFood)
        const isRolling = item.getData('type') === 'canFood';

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

                if (isRolling) {
                    // Rolling items: stronger horizontal velocity, angular velocity
                    item.body.setVelocity(
                        this.catState.facing * Phaser.Math.Between(120, 180),
                        -40
                    );
                    item.body.setAngularVelocity(this.catState.facing * Phaser.Math.Between(300, 500));
                } else {
                    // Normal items
                    item.body.setVelocity(
                        this.catState.facing * Phaser.Math.Between(20, 60),
                        -60
                    );
                    item.body.setAngularVelocity(Phaser.Math.Between(-300, 300));
                }

                if (item.getData('scoreValue') >= 100) this.triggerSlowMotion();
            }
        });
    }

    handleItemHitGround(item, platform) {
        if (!item || !item.body) return;
        if (!item.getData('isFalling') || item.getData('isBroken')) return;
        item.setData('isBroken', true);

        const scoreValue = item.getData('scoreValue');
        let noiseValue = item.getData('noiseValue');
        const itemType = item.getData('type');

        // Check if in soft zone (tatami)
        const inSoftZone = this.isInSoftZone(item.x, item.y);
        if (inSoftZone) {
            noiseValue *= 0.5; // 50% noise reduction
        }

        this.combo++;
        this.comboTimer = GAME_CONSTANTS.BASE_COMBO_TIMER * powerUpManager.getMultiplier('comboTimeMultiplier');
        if (this.combo > this.maxCombo) this.maxCombo = this.combo;

        // ローグライト: スコア倍率
        const scoreMult = powerUpManager.getMultiplier('scoreMultiplier');
        const comboMult = 1 + this.combo * 0.15;

        // Moonbeam multiplier
        const inMoonbeam = this.isInMoonbeam(item.x, item.y);
        const moonbeamMult = inMoonbeam ? 1.5 : 1.0;

        const finalScore = Math.floor(scoreValue * scoreMult * comboMult * moonbeamMult);

        this.score += finalScore;
        this.events.emit('updateScore', this.score);

        // Check for domino bonus (3+ items broken within 1 second)
        const now = this.time.now;
        if (now - this.lastBreakTime < 1000) {
            this.chainBreakCount = (this.chainBreakCount || 0) + 1;
            if (this.chainBreakCount >= 3) {
                const dominoBonus = 500;
                this.score += dominoBonus;
                this.events.emit('updateScore', this.score);
                this.showDominoBonus(item.x, item.y);
                this.chainBreakCount = 0;
            }
        } else {
            this.chainBreakCount = 1;
        }
        this.lastBreakTime = now;

        // ローグライト: 焼き魚効果
        if (powerUpManager.hasPowerUp('fish')) {
            const healAmount = powerUpManager.getEffectValue('noiseHealOnBreak');
            this.noise = Math.max(0, this.noise - healAmount);
        }

        this.addNoise(noiseValue);
        this.createBreakEffect(item.x, item.y, itemType, finalScore, inMoonbeam);
        this.shakeIntensity = Math.min(12, 3 + scoreValue / 30);
        sound.itemBreak(scoreValue / 80);

        if (this.combo >= 2) {
            this.showComboDisplay();
            ComboEffects.show(this, this.combo, item.x, item.y, this.cat);
        }

        // 猫の表情変化
        this.changeCatExpression('catHappy');
        this.time.delayedCall(500, () => this.changeCatExpression('cat'));

        this.brokenCount++;
        // this.progressText.setText(`${this.brokenCount}/${this.totalBreakables}`);

        item.destroy();

        if (this.breakables.getChildren().filter(b => !b.getData('isBroken')).length === 0) {
            this.time.delayedCall(500, () => this.triggerVictory());
        }
    }

    createBreakEffect(x, y, type, score, inMoonbeam = false) {
        const colors = {
            vase: 0x5bc0de,
            book: 0x8b4513,
            clock: 0xffd700,
            plant: 0x228b22,
            lamp: 0xfffacd,
            mug: 0xf5f5dc,
            frame: 0xdaa520,
            remote: 0x3a3a3a,
            pen: 0x2255aa,
            canFood: 0xcc8844
        };
        const color = colors[type] || 0xffffff;

        EnhancedParticles.createShards(this, x, y, color, 14, score);

        const popupText = inMoonbeam ? `+${score} ☾` : `+${score}`;
        const popup = this.add.text(x, y, popupText, {
            fontSize: '24px',
            color: inMoonbeam ? '#ffffcc' : '#ffd700',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(50);

        this.tweens.add({
            targets: popup,
            y: y - 60,
            alpha: 0,
            scale: 1.3,
            duration: 700,
            onComplete: () => popup.destroy()
        });
    }

    showDominoBonus(x, y) {
        const popup = this.add.text(x, y - 40, i18n.t('DOMINO_BONUS') + '\n+500', {
            fontSize: '28px',
            color: '#ff88ff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5).setDepth(50);

        this.tweens.add({
            targets: popup,
            y: y - 100,
            alpha: 0,
            scale: 1.5,
            duration: 1000,
            onComplete: () => popup.destroy()
        });

        sound.tone(660, 0.2);
        this.cameras.main.flash(200, 255, 136, 255);
    }

    showComboDisplay() {
        // Combo display moved to HUD (TODO)
        // this.comboText.setText(`${this.combo} COMBO!`); 

        sound.combo(this.combo);

        if (this.combo % 5 === 0) {
            const bonus = this.combo * 25;
            this.score += bonus;
            this.events.emit('updateScore', this.score);
        }
    }

    triggerSlowMotion() {
        this.slowMoTimer = GAME_CONSTANTS.SLOW_MO_DURATION;
        this.physics.world.timeScale = GAME_CONSTANTS.SLOW_MO_TIME_SCALE;
        // Use relative zoom based on base zoom for responsive support
        const targetZoom = (this.baseZoom || 1) * 1.08;
        this.cameras.main.zoomTo(targetZoom, 100);
    }

    addNoise(amount) {
        // ローグライト: 騒音倍率
        const noiseMult = powerUpManager.getMultiplier('noiseMultiplier');

        // ローグライト: 雷の効果
        if (powerUpManager.isThunderActive()) {
            return; // 騒音無効
        }

        this.noise = Math.min(100, this.noise + amount * noiseMult);
        this.updateOwnerMonitor();
        if (this.noise >= 100 && !this.gameEnded) this.triggerGameOver();
    }

    startGameTimer() {
        this.time.addEvent({
            delay: 1000,
            loop: true,
            callback: () => {
                if (this.gameEnded) return;
                this.timeLeft--;
                const m = Math.floor(this.timeLeft / 60);
                const s = this.timeLeft % 60;
                this.events.emit('updateTimer', `${m}:${s.toString().padStart(2, '0')}`);
                // if (this.timeLeft <= 20) this.timerText.setColor('#ff6666');
                if (this.timeLeft <= 10) {
                    // Timer warning effect
                }

                if (this.timeLeft <= 0) this.triggerGameOver();
            }
        });
    }

    update(time, delta) {
        if (this.gameEnded) return;

        // ローグライト: パワーアップ更新
        powerUpManager.update(delta);

        if (this.slowMoTimer > 0) {
            this.slowMoTimer--;
            if (this.slowMoTimer === 0) {
                this.physics.world.timeScale = 1;
                // Return to base zoom for responsive support
                this.cameras.main.zoomTo(this.baseZoom || 1, 150);
            }
        }

        if (this.shakeIntensity > 0) {
            // Shake relative to base scroll position for responsive support
            const baseX = this.baseScrollX || 0;
            const baseY = this.baseScrollY || 0;
            this.cameras.main.setScroll(
                baseX + Phaser.Math.Between(-this.shakeIntensity, this.shakeIntensity),
                baseY + Phaser.Math.Between(-this.shakeIntensity, this.shakeIntensity)
            );
            this.shakeIntensity *= 0.85;
            if (this.shakeIntensity < 0.5) {
                this.shakeIntensity = 0;
                this.cameras.main.setScroll(baseX, baseY);
            }
        }

        this.handlePlayerInput();
        this.updateCatVisuals(time);
        this.decayNoise(delta);
        this.updateOwnerMonitor(); // アニメーション更新（点滅など）
        this.updateComboSystem(delta);
    }

    handlePlayerInput() {
        const body = this.cat.body;
        const onGround = body.blocked.down;
        const onWallL = body.blocked.left && !onGround;
        const onWallR = body.blocked.right && !onGround;

        if ((onWallL || onWallR) && body.velocity.y > 0) {
            body.setVelocityY(Math.min(body.velocity.y, 100));
        }

        let moveL = this.cursors.left.isDown || this.keys.A.isDown;
        let moveR = this.cursors.right.isDown || this.keys.D.isDown;

        // モバイル入力 (Uses HUD Joystick)
        if (this.hud && this.hud.joystick) {
            const dir = this.hud.joystick.getDirection();
            if (dir.x < -0.3) moveL = true;
            if (dir.x > 0.3) moveR = true;
        }

        // ローグライト: 速度倍率
        const speedMult = powerUpManager.getMultiplier('speedMultiplier');

        // Slow zone (cobweb) effect
        const inSlowZone = this.isInSlowZone(this.cat.x, this.cat.y);
        const slowMult = inSlowZone ? 0.5 : 1.0;

        const baseSpeed = 280 * speedMult * slowMult;

        if (moveL) {
            body.setVelocityX(-baseSpeed);
            this.catState.facing = -1;
            if (onGround) this.addNoise(0.004);
        } else if (moveR) {
            body.setVelocityX(baseSpeed);
            this.catState.facing = 1;
            if (onGround) this.addNoise(0.004);
        } else {
            body.setVelocityX(body.velocity.x * 0.85);
        }

        // Prevent movement when comfy stunned
        if (this.catComfyStunned) {
            body.setVelocityX(0);
        }

        let jumpPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
            Phaser.Input.Keyboard.JustDown(this.keys.W) ||
            Phaser.Input.Keyboard.JustDown(this.keys.SPACE);

        // モバイルジャンプ (Uses HUD Button)
        if (this.hud && this.hud.jumpBtn && this.hud.jumpBtn.isPressed() && !this.lastJumpPressed) {
            jumpPressed = true;
        }
        this.lastJumpPressed = (this.hud && this.hud.jumpBtn) ? this.hud.jumpBtn.isPressed() : false;

        // ローグライト: ジャンプ倍率
        const jumpMult = powerUpManager.getMultiplier('jumpMultiplier');

        if (jumpPressed) {
            if (onGround) {
                body.setVelocityY(-500 * jumpMult);
                this.addNoise(1.5);
                sound.jump();
                EnhancedParticles.createDustBurst(this, this.cat.x, this.cat.y + 15, 8, 'down');
                showCatDialogue(this, this.cat.x, this.cat.y, 'jump');
                this.changeCatExpression('catSurprised');
                this.time.delayedCall(200, () => this.changeCatExpression('cat'));
            } else if (onWallL && this.catState.canWallKick) {
                body.setVelocity(400, -480 * jumpMult);
                this.catState.facing = 1;
                this.executeWallKick(-1);
            } else if (onWallR && this.catState.canWallKick) {
                body.setVelocity(-400, -480 * jumpMult);
                this.catState.facing = -1;
                this.executeWallKick(1);
            } else if (this.catState.hasDoubleJump && !this.catState.doubleJumpUsed && !onGround) {
                // 二段ジャンプ
                body.setVelocityY(-500 * jumpMult);
                this.catState.doubleJumpUsed = true;
                sound.jump();
                EnhancedParticles.createSparkles(this, this.cat.x, this.cat.y, 10, 0xffff00);
                showCatDialogue(this, this.cat.x, this.cat.y, 'jump');
            }
        }

        this.catState.onGround = onGround;
        this.catState.onWallL = onWallL;
        this.catState.onWallR = onWallR;
    }

    executeWallKick(dir) {
        this.catState.canWallKick = false;
        this.time.delayedCall(120, () => {
            this.catState.canWallKick = true;
        });
        this.addNoise(1);
        sound.wallKick();
        EnhancedParticles.createDustBurst(this, this.cat.x + dir * 18, this.cat.y, 8, dir > 0 ? 'right' : 'left');
        showCatDialogue(this, this.cat.x, this.cat.y, 'wallKick');

        const kickContainer = this.add.container(this.cat.x, this.cat.y - 40).setDepth(50);
        kickContainer.add(this.add.image(-40, 0, 'pawprint').setScale(0.4));
        kickContainer.add(this.add.text(10, 0, 'Wall Kick!', {
            fontSize: '18px',
            color: '#ffff66',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0, 0.5));

        this.tweens.add({
            targets: kickContainer,
            y: kickContainer.y - 50,
            alpha: 0,
            scale: 1.3,
            duration: 500,
            onComplete: () => kickContainer.destroy()
        });

        this.shakeIntensity = 4;
        this.changeCatExpression('catSmug');
        this.time.delayedCall(300, () => this.changeCatExpression('cat'));
    }

    changeCatExpression(texture) {
        this.catExpression = texture;
        this.catSprite.setTexture(texture);
    }


    decayNoise(delta) {
        this.noise = Math.max(0, this.noise - 3 * delta / 1000);
    }

    updateComboSystem(delta) {
        if (this.comboTimer > 0) {
            this.comboTimer -= delta / 16;
        } else if (this.combo > 0) {
            this.combo = 0;
            this.tweens.add({
                targets: this.comboContainer,
                alpha: 0,
                duration: 200
            });
        }
    }

    triggerGameOver() {
        if (this.gameEnded) return;
        this.gameEnded = true;

        // モニター更新（激怒）
        this.updateOwnerMonitor();

        // this.ownerFace.setTexture('ownerAngry'); // 廃止
        // this.doorLight.setAlpha(1); // 廃止
        // this.zzzIcon.setVisible(false); // 廃止

        this.cat.body.setVelocity(0, -350);
        this.shakeIntensity = 15;
        this.cameras.main.flash(250, 255, 100, 100);
        showCatDialogue(this, this.cat.x, this.cat.y, 'defeat');
        this.changeCatExpression('catSurprised');
        this.time.delayedCall(700, () => this.showResultScreen(false));
    }

    triggerVictory() {
        if (this.gameEnded) return;
        this.gameEnded = true;
        sound.clear();
        sound.victoryMeow();
        this.cameras.main.flash(300, 255, 255, 200);
        this.changeCatExpression('catVictory');
        VictoryEffects.show(this, this.cat.x, this.cat.y);
        showCatDialogue(this, this.cat.x, this.cat.y, 'victory');
        this.time.delayedCall(500, () => this.showResultScreen(true));
    }

    showResultScreen(isVictory) {
        sound.stopAll();
        // HUDの入力を止めて結果画面のボタンを優先する
        if (this.scene.isActive('HUDScene')) {
            this.scene.stop('HUDScene');
        }

        const uiW = GameLayout.W;
        const uiH = GameLayout.H;
        const camera = this.cameras.main;
        const zoom = camera.zoom || 1;
        const center = camera.getWorldPoint(uiW / 2, uiH / 2);
        const uiScale = GameLayout.scale(1) / zoom;
        const uiOffset = (value) => GameLayout.scale(value) / zoom;
        const uiFont = (value) => Math.max(10, GameLayout.fontSize(value) / zoom);

        const overlay = this.add.rectangle(center.x, center.y, uiW / zoom, uiH / zoom, 0x000000, 0)
            .setDepth(200);
        this.tweens.add({
            targets: overlay,
            fillAlpha: 0.85,
            duration: 400
        });

        this.time.delayedCall(300, () => {
            const c = this.add.container(center.x, center.y)
                .setDepth(210)
                .setAlpha(0);

            if (isVictory) {
                c.add(this.add.image(0, -uiOffset(130), 'celebrate').setScale(1.2 * uiScale));
                c.add(this.add.text(0, -uiOffset(70), i18n.t('RESULT_COMPLETE'), {
                    fontSize: uiFont(32) + 'px',
                    color: '#44ff44',
                    fontStyle: 'bold',
                    stroke: '#000',
                    strokeThickness: uiOffset(4)
                }).setOrigin(0.5));

                const tb = this.timeLeft * 10;
                const sb = 500;
                const cb = this.maxCombo * 50;
                const total = this.score + tb + sb + cb;

                c.add(this.add.text(-uiOffset(90), -uiOffset(20), i18n.t('RESULT_SCORE'), {
                    fontSize: uiFont(18) + 'px',
                    color: '#aaa'
                }).setOrigin(0, 0.5));
                c.add(this.add.text(uiOffset(90), -uiOffset(20), this.score.toString(), {
                    fontSize: uiFont(18) + 'px',
                    color: '#ffd700'
                }).setOrigin(1, 0.5));
                c.add(this.add.text(-uiOffset(90), uiOffset(8), i18n.t('RESULT_TIME_BONUS'), {
                    fontSize: uiFont(15) + 'px',
                    color: '#aaa'
                }).setOrigin(0, 0.5));
                c.add(this.add.text(uiOffset(90), uiOffset(8), `+${tb}`, {
                    fontSize: uiFont(15) + 'px',
                    color: '#88ff88'
                }).setOrigin(1, 0.5));
                c.add(this.add.text(-uiOffset(90), uiOffset(32), i18n.t('RESULT_SURVIVAL'), {
                    fontSize: uiFont(15) + 'px',
                    color: '#aaa'
                }).setOrigin(0, 0.5));
                c.add(this.add.text(uiOffset(90), uiOffset(32), `+${sb}`, {
                    fontSize: uiFont(15) + 'px',
                    color: '#88ff88'
                }).setOrigin(1, 0.5));
                c.add(this.add.text(-uiOffset(90), uiOffset(56), i18n.t('RESULT_COMBO'), {
                    fontSize: uiFont(15) + 'px',
                    color: '#aaa'
                }).setOrigin(0, 0.5));
                c.add(this.add.text(uiOffset(90), uiOffset(56), `+${cb}`, {
                    fontSize: uiFont(15) + 'px',
                    color: '#88ff88'
                }).setOrigin(1, 0.5));
                c.add(this.add.rectangle(0, uiOffset(80), uiOffset(200), uiOffset(2), 0x666666));
                c.add(this.add.text(0, uiOffset(105), `TOTAL: ${total}`, {
                    fontSize: uiFont(28) + 'px',
                    color: '#ffd700',
                    fontStyle: 'bold'
                }).setOrigin(0.5));

                // ストーリー進行
                const result = storyProgress.completeStage(total);
                storyProgress.save();

                if (result.ending) {
                    c.add(this.add.text(0, uiOffset(140), i18n.t('RESULT_ALL_CLEAR_EMOJI'), {
                        fontSize: uiFont(20) + 'px',
                        color: '#ff66ff',
                        fontStyle: 'bold'
                    }).setOrigin(0.5));
                    c.add(this.add.text(0, uiOffset(165), i18n.t('RESULT_BACK_STAGE1'), {
                        fontSize: uiFont(14) + 'px',
                        color: '#aaaacc'
                    }).setOrigin(0.5));
                } else if (result.completed) {
                    c.add(this.add.text(0, uiOffset(140), i18n.t('RESULT_ALL_CLEAR'), {
                        fontSize: uiFont(20) + 'px',
                        color: '#ff66ff'
                    }).setOrigin(0.5));
                }
            } else {
                c.add(this.add.image(0, -uiOffset(100), 'shock').setScale(1.3 * uiScale));
                c.add(this.add.text(0, -uiOffset(30), i18n.t('GAMEOVER_FOUND'), {
                    fontSize: uiFont(42) + 'px',
                    color: '#ff5555',
                    fontStyle: 'bold',
                    stroke: '#000',
                    strokeThickness: uiOffset(4)
                }).setOrigin(0.5));
                c.add(this.add.text(0, uiOffset(30), `${i18n.t('GAMEOVER_SCORE')} ${this.score}`, {
                    fontSize: uiFont(28) + 'px',
                    color: '#ffd700'
                }).setOrigin(0.5));
                c.add(this.add.text(0, uiOffset(70), `${i18n.t('GAMEOVER_MAX_COMBO')} ${this.maxCombo}`, {
                    fontSize: uiFont(18) + 'px',
                    color: '#aaa'
                }).setOrigin(0.5));
            }

            const makeBtn = (y, iconKey, txt, cb) => {
                const bg = this.add.rectangle(0, y, uiOffset(200), uiOffset(45), 0x4a4a8a)
                    .setStrokeStyle(uiOffset(2), 0x7a7aba)
                    .setInteractive({ useHandCursor: true });
                const icon = this.add.image(-uiOffset(70), y, iconKey).setScale(0.6 * uiScale);
                const tx = this.add.text(uiOffset(10), y, txt, {
                    fontSize: uiFont(18) + 'px',
                    color: '#fff'
                }).setOrigin(0, 0.5);
                bg.on('pointerover', () => bg.setFillStyle(0x6a6aaa));
                bg.on('pointerout', () => bg.setFillStyle(0x4a4a8a));
                bg.on('pointerdown', () => {
                    sound.tone(440, 0.1);
                    cb();
                });
                return [bg, icon, tx];
            };

            if (isVictory) {
                c.add(makeBtn(uiOffset(170), 'iconRetry', i18n.t('BTN_NEXT'), () => {
                    this.scene.start('PowerUpScene');
                }));
                c.add(makeBtn(uiOffset(220), 'iconHome', i18n.t('BTN_TITLE'), () => {
                    this.scene.start('TitleScene');
                }));
            } else {
                c.add(makeBtn(uiOffset(130), 'iconRetry', i18n.t('BTN_RETRY'), () => {
                    this.scene.restart();
                }));
                c.add(makeBtn(uiOffset(180), 'iconHome', i18n.t('BTN_TITLE'), () => {
                    powerUpManager.reset();
                    this.scene.start('TitleScene');
                }));
            }

            this.tweens.add({
                targets: c,
                alpha: 1,
                y: center.y - uiOffset(10),
                duration: 350,
                ease: 'Back.easeOut'
            });
        });
    }

    activateThunder() {
        if (powerUpManager.activateThunder()) {
            sound.tone(800, 0.2, 'sawtooth');
            showCatDialogue(this, this.cat.x, this.cat.y, 'jump');
            this.cameras.main.flash(100, 255, 255, 100);
            return true;
        }
        return false;
    }

    shutdown() {
        // Remove resize listener
        this.scale.off('resize', this.handleResize, this);

        // Stop HUD scene to prevent memory leaks
        this.scene.stop('HUDScene');

        // Clear particle pools to prevent stale references
        if (typeof particlePools !== 'undefined') {
            particlePools.clear();
        }
    }
}
