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
        this.timeLeft = 90;
        this.gameEnded = false;
        this.slowMoTimer = 0;
        this.shakeIntensity = 0;
        this.brokenCount = 0;
        this.catExpression = 'cat';
        this.lastJumpPressed = false;

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

        // Fixed game world dimensions
        const worldW = GAME_CONSTANTS.WORLD_WIDTH;
        const worldH = GAME_CONSTANTS.WORLD_HEIGHT;

        // Calculate zoom to fit the game world in the screen (FIT mode)
        const zoomX = screenW / worldW;
        const zoomY = screenH / worldH;
        const zoom = Math.min(zoomX, zoomY);

        this.cameras.main.setZoom(zoom);

        // Remove bounds to allow viewing "void" space (filled by background)
        this.cameras.main.removeBounds();

        // Calculate scroll position to center the game world on screen
        // The visible area in world coordinates is (screenW/zoom) x (screenH/zoom)
        // We want the center of this visible area to be at (worldW/2, worldH/2)
        const visibleW = screenW / zoom;
        const visibleH = screenH / zoom;

        // Vertical Alignment Strategy
        // scrollX/scrollY is the top-left corner of the view in world coords
        const scrollX = (worldW / 2) - (visibleW / 2);

        let scrollY;
        if (screenH > screenW) {
            // Portrait: Align bottom logic
            // We want floor (Y=550) to be visible near bottom, leaving space for HUD controls.
            // Leave 150px screen margin (converted to world units).
            const marginBottom = 150 / zoom;
            scrollY = (worldH + marginBottom) - visibleH;
        } else {
            // Landscape: Center Vertically
            scrollY = (worldH / 2) - (visibleH / 2);
        }

        this.cameras.main.setScroll(scrollX, scrollY);
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
        this.add.rectangle(680, 120, 100, 150, 0x1a1a30)
            .setStrokeStyle(6, 0x3a3a5a)
            .setDepth(0)
            .setScrollFactor(0.5);
        this.add.rectangle(680, 120, 85, 135, 0x080818)
            .setDepth(0)
            .setScrollFactor(0.5);
        this.add.image(700, 95, 'moon').setScale(0.5)
            .setDepth(0)
            .setScrollFactor(0.5);

        // 星（窓の外）
        for (let i = 0; i < 5; i++) {
            this.add.circle(
                650 + Math.random() * 60,
                80 + Math.random() * 80,
                1,
                0xffffff,
                0.5
            ).setDepth(0).setScrollFactor(0.5);
        }

        this.add.rectangle(680, 120, 4, 135, 0x3a3a5a).setDepth(0).setScrollFactor(0.5);
        this.add.rectangle(680, 120, 85, 4, 0x3a3a5a).setDepth(0).setScrollFactor(0.5);
        this.add.rectangle(620, 120, 20, 155, 0x5a3a6a, 0.7).setDepth(0).setScrollFactor(0.5);
        this.add.rectangle(740, 120, 20, 155, 0x5a3a6a, 0.7).setDepth(0).setScrollFactor(0.5);

        // 床
        this.add.rectangle(W / 2, H - 30, W, 60, 0x2a2520);
        for (let x = 0; x < W; x += 80) {
            this.add.rectangle(x + 40, H - 30, 78, 58, 0x352a20, 0.5);
        }
    }



    createAtmosphere() {
        // Moonlight Beams (from Window)
        const light = this.add.graphics();
        light.fillStyle(0xffffcc, 0.08); // Very subtle warm white
        light.beginPath();
        light.moveTo(680, 120); // Window center
        light.lineTo(630, 120);
        light.lineTo(500, H);
        light.lineTo(800, H);
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

        // 壁と床
        this.addWall(8, H / 2, 16, H);
        this.addWall(W - 8, H / 2, 16, H);
        this.addPlatform(W / 2, H - 5, W - 20, 10, 0x3a3530);

        // ステージ名表示（一時的）
        const stageNameText = this.add.text(W / 2, 60, layout.name, {
            fontSize: '28px',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(150).setScrollFactor(0).setAlpha(0);

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
        });

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
        const wall = this.add.rectangle(x, y, w, h, 0x101015, 0);
        this.physics.add.existing(wall, true);
        this.walls.add(wall);
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
                if (powerUpManager.activateThunder()) {
                    sound.tone(800, 0.2, 'sawtooth');
                    showCatDialogue(this, this.cat.x, this.cat.y, 'jump');
                    this.cameras.main.flash(100, 255, 255, 100);
                }
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
                if (item.getData('scoreValue') >= 100) this.triggerSlowMotion();
            }
        });
    }

    handleItemHitGround(item, platform) {
        if (!item || !item.body) return;
        if (!item.getData('isFalling') || item.getData('isBroken')) return;
        item.setData('isBroken', true);

        const scoreValue = item.getData('scoreValue');
        const noiseValue = item.getData('noiseValue');
        const itemType = item.getData('type');

        this.combo++;
        this.comboTimer = GAME_CONSTANTS.BASE_COMBO_TIMER * powerUpManager.getMultiplier('comboTimeMultiplier');
        if (this.combo > this.maxCombo) this.maxCombo = this.combo;

        // ローグライト: スコア倍率
        const scoreMult = powerUpManager.getMultiplier('scoreMultiplier');
        const comboMult = 1 + this.combo * 0.15;
        const finalScore = Math.floor(scoreValue * scoreMult * comboMult);

        this.score += finalScore;
        this.events.emit('updateScore', this.score);

        // ローグライト: 焼き魚効果
        if (powerUpManager.hasPowerUp('fish')) {
            const healAmount = powerUpManager.getEffectValue('noiseHealOnBreak');
            this.noise = Math.max(0, this.noise - healAmount);
        }

        this.addNoise(noiseValue);
        this.createBreakEffect(item.x, item.y, itemType, finalScore);
        this.shakeIntensity = Math.min(12, 3 + scoreValue / 30);
        sound.hit(scoreValue / 80);

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

    createBreakEffect(x, y, type, score) {
        const colors = {
            vase: 0x5bc0de,
            book: 0x8b4513,
            clock: 0xffd700,
            plant: 0x228b22,
            lamp: 0xfffacd,
            mug: 0xf5f5dc,
            frame: 0xdaa520,
            remote: 0x3a3a3a,
            pen: 0x2255aa
        };
        const color = colors[type] || 0xffffff;

        EnhancedParticles.createShards(this, x, y, color, 14, score);

        const popup = this.add.text(x, y, `+${score}`, {
            fontSize: '24px',
            color: '#ffd700',
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
        this.cameras.main.zoomTo(1.08, 100);
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

                if (this.timeLeft <= 0) this.triggerVictory();
            }
        });
    }

    update(time, delta) {
        if (this.gameEnded) return;

        // ローグライト: パワーアップ更新
        powerUpManager.update(delta);

        // 雷UI更新
        if (this.thunderUI) {
            if (powerUpManager.isThunderActive()) {
                this.thunderUI.setText('⚡ サイレント中！');
                this.thunderUI.setColor('#00ff00');
            } else {
                const cooldown = powerUpManager.getThunderCooldown();
                if (cooldown > 0) {
                    this.thunderUI.setText(`⚡ ${Math.ceil(cooldown)}秒`);
                    this.thunderUI.setColor('#888888');
                } else {
                    this.thunderUI.setText('⚡ 準備完了 (E)');
                    this.thunderUI.setColor('#ffff00');
                }
            }
        }

        if (this.slowMoTimer > 0) {
            this.slowMoTimer--;
            if (this.slowMoTimer === 0) {
                this.physics.world.timeScale = 1;
                this.cameras.main.zoomTo(1, 150);
            }
        }

        if (this.shakeIntensity > 0) {
            this.cameras.main.setScroll(
                Phaser.Math.Between(-this.shakeIntensity, this.shakeIntensity),
                Phaser.Math.Between(-this.shakeIntensity, this.shakeIntensity)
            );
            this.shakeIntensity *= 0.85;
            if (this.shakeIntensity < 0.5) {
                this.shakeIntensity = 0;
                this.cameras.main.setScroll(0, 0);
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
        const baseSpeed = 280 * speedMult;

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
        sound.gameOver();

        // モニター更新（激怒）
        this.updateOwnerMonitor();

        // this.ownerFace.setTexture('ownerAngry'); // 廃止
        // this.doorLight.setAlpha(1); // 廃止
        // this.zzzIcon.setVisible(false); // 廃止

        sound.hiss();
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
        const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0)
            .setDepth(200)
            .setScrollFactor(0);
        this.tweens.add({
            targets: overlay,
            fillAlpha: 0.85,
            duration: 400
        });

        this.time.delayedCall(300, () => {
            const c = this.add.container(W / 2, H / 2)
                .setDepth(210)
                .setAlpha(0)
                .setScrollFactor(0);

            if (isVictory) {
                c.add(this.add.image(0, -130, 'celebrate').setScale(1.2));
                c.add(this.add.text(0, -70, 'ミッションコンプリート！', {
                    fontSize: '32px',
                    color: '#44ff44',
                    fontStyle: 'bold',
                    stroke: '#000',
                    strokeThickness: 4
                }).setOrigin(0.5));

                const tb = this.timeLeft * 10;
                const sb = 500;
                const cb = this.maxCombo * 50;
                const total = this.score + tb + sb + cb;

                c.add(this.add.text(-90, -20, 'スコア:', { fontSize: '18px', color: '#aaa' }).setOrigin(0, 0.5));
                c.add(this.add.text(90, -20, this.score.toString(), { fontSize: '18px', color: '#ffd700' }).setOrigin(1, 0.5));
                c.add(this.add.text(-90, 8, 'タイムボーナス:', { fontSize: '15px', color: '#aaa' }).setOrigin(0, 0.5));
                c.add(this.add.text(90, 8, `+${tb}`, { fontSize: '15px', color: '#88ff88' }).setOrigin(1, 0.5));
                c.add(this.add.text(-90, 32, '生還ボーナス:', { fontSize: '15px', color: '#aaa' }).setOrigin(0, 0.5));
                c.add(this.add.text(90, 32, `+${sb}`, { fontSize: '15px', color: '#88ff88' }).setOrigin(1, 0.5));
                c.add(this.add.text(-90, 56, 'コンボボーナス:', { fontSize: '15px', color: '#aaa' }).setOrigin(0, 0.5));
                c.add(this.add.text(90, 56, `+${cb}`, { fontSize: '15px', color: '#88ff88' }).setOrigin(1, 0.5));
                c.add(this.add.rectangle(0, 80, 200, 2, 0x666666));
                c.add(this.add.text(0, 105, `TOTAL: ${total}`, { fontSize: '28px', color: '#ffd700', fontStyle: 'bold' }).setOrigin(0.5));

                // ストーリー進行
                const result = storyProgress.completeStage(total);
                storyProgress.save();

                if (result.ending) {
                    c.add(this.add.text(0, 140, '🎉 全ステージクリア！ 🎉', {
                        fontSize: '20px',
                        color: '#ff66ff',
                        fontStyle: 'bold'
                    }).setOrigin(0.5));
                    c.add(this.add.text(0, 165, 'ステージ1に戻ります', {
                        fontSize: '14px',
                        color: '#aaaacc'
                    }).setOrigin(0.5));
                } else if (result.completed) {
                    c.add(this.add.text(0, 140, '全ステージクリア！', { fontSize: '20px', color: '#ff66ff' }).setOrigin(0.5));
                }
            } else {
                c.add(this.add.image(0, -100, 'shock').setScale(1.3));
                c.add(this.add.text(0, -30, 'みつかった！', {
                    fontSize: '42px',
                    color: '#ff5555',
                    fontStyle: 'bold',
                    stroke: '#000',
                    strokeThickness: 4
                }).setOrigin(0.5));
                c.add(this.add.text(0, 30, `スコア: ${this.score}`, { fontSize: '28px', color: '#ffd700' }).setOrigin(0.5));
                c.add(this.add.text(0, 70, `最大コンボ: ${this.maxCombo}`, { fontSize: '18px', color: '#aaa' }).setOrigin(0.5));
            }

            const makeBtn = (y, iconKey, txt, cb) => {
                const bg = this.add.rectangle(0, y, 200, 45, 0x4a4a8a)
                    .setStrokeStyle(2, 0x7a7aba)
                    .setInteractive({ useHandCursor: true });
                const icon = this.add.image(-70, y, iconKey).setScale(0.6);
                const tx = this.add.text(10, y, txt, { fontSize: '18px', color: '#fff' }).setOrigin(0, 0.5);
                bg.on('pointerover', () => bg.setFillStyle(0x6a6aaa));
                bg.on('pointerout', () => bg.setFillStyle(0x4a4a8a));
                bg.on('pointerdown', () => {
                    sound.tone(440, 0.1);
                    cb();
                });
                return [bg, icon, tx];
            };

            if (isVictory) {
                c.add(makeBtn(170, 'iconRetry', '次へ', () => {
                    this.scene.start('PowerUpScene');
                }));
                c.add(makeBtn(220, 'iconHome', 'タイトル', () => {
                    this.scene.start('TitleScene');
                }));
            } else {
                c.add(makeBtn(130, 'iconRetry', 'リトライ', () => {
                    this.scene.restart();
                }));
                c.add(makeBtn(180, 'iconHome', 'タイトル', () => {
                    powerUpManager.reset();
                    this.scene.start('TitleScene');
                }));
            }

            this.tweens.add({
                targets: c,
                alpha: 1,
                y: H / 2 - 10,
                duration: 350,
                ease: 'Back.easeOut'
            });
        });
    }

    shutdown() {
        // Remove resize listener
        this.scale.off('resize', this.handleResize, this);

        // Stop HUD scene to prevent memory leaks
        this.scene.stop('HUDScene');
    }
}
