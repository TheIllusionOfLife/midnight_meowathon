class HUDScene extends Phaser.Scene {
    constructor() {
        super('HUDScene');
    }

    create(data) {
        this.mainScene = data.mainScene;
        GameLayout.init(this);

        // State for Monitor
        this.noise = 0;

        // UI Containers
        this.scoreText = null;
        this.timerText = null;
        this.mobileControls = null;
        this.noiseGauge = null;
        this.ownerPortrait = null;
        this.thunderLabel = null;
        this.thunderBtn = null;
        this.thunderIcon = null;

        // Create UI Elements
        this.createScore();
        this.createTimer();
        this.createOwnerMonitor();
        this.createPowerUps();
        this.createThunderIndicator();

        // Mobile Controls
        this.createMobileControls();

        // Listen for updates from Main Scene
        if (this.mainScene) {
            this.mainScene.events.on('updateScore', this.updateScore, this);
            this.mainScene.events.on('updateTimer', this.updateTimer, this);
            this.mainScene.events.on('updateNoise', this.updateNoise, this);
        }

        // Handle Resize
        this.scale.on('resize', this.handleResize, this);
    }

    handleResize() {
        GameLayout.init(this); // Update context

        // Destroy mobile controls before removing children
        if (this.joystick) this.joystick.destroy();
        if (this.jumpBtn) this.jumpBtn.destroy();
        if (this.thunderBtn) this.thunderBtn.destroy();
        if (this.thunderIcon) this.thunderIcon.destroy();
        if (this.thunderLabel) this.thunderLabel.destroy();

        this.children.removeAll(true);
        this.createScore();
        this.createTimer();
        this.createOwnerMonitor();
        this.createPowerUps();
        this.createThunderIndicator();
        this.createMobileControls();

        // Restore state
        this.updateNoise(this.noise);
    }

    createScore() {
        const x = GameLayout.isPortrait ? GameLayout.W - 20 : GameLayout.W - 40;
        const y = GameLayout.isPortrait ? 60 : 40;

        this.scoreText = this.add.text(x, y, '0 SCORE', {
            fontSize: GameLayout.fontSize(24) + 'px',
            fontFamily: 'Fredoka One',
            color: '#ffd700',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(1, 0);
    }

    createTimer() {
        const x = GameLayout.W / 2;
        const y = GameLayout.isPortrait ? 60 : 40;

        this.timerText = this.add.text(x, y, '0:00', {
            fontSize: GameLayout.fontSize(32) + 'px',
            fontFamily: 'Fredoka One',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5, 0);
    }

    createOwnerMonitor() {
        const x = GameLayout.isPortrait ? 50 : 60;
        const y = GameLayout.isPortrait ? 60 : 60;

        // Use simpler positioning
        this.ownerMonitorPos = { x, y };

        // Frame
        this.add.image(x, y, 'ui_monitor_frame').setDepth(100);

        // Portrait
        this.ownerPortrait = this.add.image(x, y, 'ui_owner_sleep')
            .setDepth(100)
            .setScale(0.8);

        // Gauge Graphics
        this.noiseGauge = this.add.graphics();
        this.noiseGauge.setDepth(100);

        // Speaker Icon
        this.add.image(x + 30, y + 30, 'iconSpeaker')
            .setScale(0.4)
            .setDepth(100);

        this.updateOwnerMonitorVisuals();
    }

    updateOwnerMonitorVisuals() {
        if (!this.noiseGauge || !this.ownerPortrait) return;

        const maxNoise = 100;
        const ratio = Math.min(this.noise / maxNoise, 1.0);

        // Gauge
        this.noiseGauge.clear();
        this.noiseGauge.lineStyle(6, 0x111122);
        this.noiseGauge.beginPath();
        this.noiseGauge.arc(this.ownerMonitorPos.x, this.ownerMonitorPos.y, 44, 0, Math.PI * 2);
        this.noiseGauge.strokePath();

        let color = 0x44dd44;
        let faceState = 'ui_owner_sleep';

        if (ratio > 0.8) {
            color = 0xff0000;
            faceState = 'ui_owner_angry';
        } else if (ratio > 0.5) {
            color = 0xffff00;
            faceState = 'ui_owner_wake';
        }

        if (ratio > 0) {
            this.noiseGauge.lineStyle(6, color);
            this.noiseGauge.beginPath();
            const startAngle = Phaser.Math.DegToRad(-90);
            const endAngle = Phaser.Math.DegToRad(-90 + 360 * ratio);
            this.noiseGauge.arc(this.ownerMonitorPos.x, this.ownerMonitorPos.y, 44, startAngle, endAngle);
            this.noiseGauge.strokePath();
        }

        // Face Update
        if (this.ownerPortrait.texture.key !== faceState) {
            this.ownerPortrait.setTexture(faceState);
            if (faceState === 'ui_owner_angry') {
                this.cameras.main.shake(200, 0.01);
                this.ownerPortrait.setTint(0xffcccc);
            } else {
                this.ownerPortrait.clearTint();
            }
        }
    }

    createPowerUps() {
        if (typeof powerUpManager === 'undefined' || !powerUpManager.activePowerUps) return;
        if (typeof POWERUPS === 'undefined') return;

        const startY = 130;
        powerUpManager.activePowerUps.forEach((id, index) => {
            if (!POWERUPS[id]) return;
            this.add.image(40 + index * 40, startY, POWERUPS[id].icon)
                .setScale(0.8)
                .setOrigin(0.5, 0.5);
        });
    }

    createMobileControls() {
        if (!DeviceDetector.isMobile()) return;

        // Use default positions which are now GameLayout percentage based
        // VirtualJoystick defaults: x=12%, y=85%
        // JumpButton defaults: x=88%, y=85%

        this.joystick = new VirtualJoystick(this);
        this.jumpBtn = new JumpButton(this);

        // Make controls visible
        this.joystick.base.setVisible(true);
        this.joystick.stick.setVisible(true);
        this.jumpBtn.show();

        this.createThunderButton();
    }

    updateScore(score) {
        if (this.scoreText) this.scoreText.setText(score + ' SCORE');
    }

    updateTimer(time) {
        if (this.timerText) this.timerText.setText(time);
    }

    updateNoise(noise) {
        this.noise = noise;
        this.updateOwnerMonitorVisuals();
    }

    update() {
        if (!this.thunderLabel || !powerUpManager) return;

        const isActive = powerUpManager.isThunderActive();
        const cooldown = Math.ceil(powerUpManager.getThunderCooldown());
        const remaining = Math.ceil(powerUpManager.getThunderRemaining());

        if (isActive) {
            this.thunderLabel.setText(`⚡ 残り ${remaining}秒`);
            this.thunderLabel.setColor('#44ff44');
            if (this.thunderBtn) this.thunderBtn.setAlpha(0.7);
        } else if (cooldown > 0) {
            this.thunderLabel.setText(`⚡ CD ${cooldown}秒`);
            this.thunderLabel.setColor('#888888');
            if (this.thunderBtn) this.thunderBtn.setAlpha(0.5);
        } else {
            const readyText = DeviceDetector.isMobile() ? '⚡ READY' : '⚡ READY (E)';
            this.thunderLabel.setText(readyText);
            this.thunderLabel.setColor('#ffff66');
            if (this.thunderBtn) this.thunderBtn.setAlpha(1);
        }
    }

    createThunderIndicator() {
        if (!powerUpManager || !powerUpManager.hasPowerUp('thunder')) return;

        const isMobile = DeviceDetector.isMobile();
        const fontSize = GameLayout.fontSize(isMobile ? 12 : 14);
        const x = isMobile ? GameLayout.controlsRight : GameLayout.W - GameLayout.scale(20);
        const y = isMobile
            ? GameLayout.controlsBottom - GameLayout.scale(130)
            : (GameLayout.isPortrait ? 100 : 70);

        this.thunderLabel = this.add.text(x, y, '⚡ READY', {
            fontSize: fontSize + 'px',
            fontFamily: 'Fredoka One',
            color: '#ffff66',
            stroke: '#000000',
            strokeThickness: GameLayout.scale(2)
        }).setOrigin(isMobile ? 0.5 : 1, 0.5);
    }

    createThunderButton() {
        if (!powerUpManager || !powerUpManager.hasPowerUp('thunder')) return;

        const x = GameLayout.controlsRight;
        const y = GameLayout.controlsBottom - (GameLayout.isPortrait ? GameLayout.scale(110) : GameLayout.scale(90));
        const radius = GameLayout.scale(GameLayout.isPortrait ? 20 : 18);

        this.thunderBtn = this.add.circle(x, y, radius, 0x5a3a8a, 0.9)
            .setStrokeStyle(GameLayout.scale(2), 0x8a6acc)
            .setDepth(1002)
            .setScrollFactor(0)
            .setInteractive({ useHandCursor: true });

        this.thunderIcon = this.add.image(x, y, 'iconThunder')
            .setScale(GameLayout.scale(0.7))
            .setDepth(1003)
            .setScrollFactor(0);

        this.thunderBtn.on('pointerdown', () => {
            if (this.mainScene && this.mainScene.activateThunder) {
                this.mainScene.activateThunder();
            }
        });
    }

    shutdown() {
        // Remove event listeners from main scene
        if (this.mainScene) {
            this.mainScene.events.off('updateScore', this.updateScore, this);
            this.mainScene.events.off('updateTimer', this.updateTimer, this);
            this.mainScene.events.off('updateNoise', this.updateNoise, this);
        }

        // Remove resize listener
        this.scale.off('resize', this.handleResize, this);

        // Destroy mobile controls properly
        if (this.joystick) this.joystick.destroy();
        if (this.jumpBtn) this.jumpBtn.destroy();
        if (this.thunderBtn) this.thunderBtn.destroy();
        if (this.thunderIcon) this.thunderIcon.destroy();
        if (this.thunderLabel) this.thunderLabel.destroy();
    }
}
