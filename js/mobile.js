// モバイル対応 - 仮想ジョイスティック、タッチ操作、レスポンシブ

class VirtualJoystick {
    constructor(scene, options = {}) {
        this.scene = scene;
        this.destroyed = false;
        this.inputScale = 1;

        // Use percentage-based positioning
        const {
            xPercent = 0.12,
            yPercent = 0.85,
            radiusPercent = 0.08,
            touchOffsetX = 0,
            touchOffsetY = 0
        } = options;

        this.xPercent = xPercent;
        this.yPercent = yPercent;
        this.radiusPercent = radiusPercent;
        this.touchOffsetX = touchOffsetX;
        this.touchOffsetY = touchOffsetY;

        // Calculate actual positions
        this.updateDimensions();

        this.stickX = this.baseX;
        this.stickY = this.baseY;
        this.active = false;
        this.pointerId = null; // Track specific pointer for multi-touch

        // ベース円
        this.base = scene.add.circle(this.baseX, this.baseY, this.radius, 0x333366, 0.5).setDepth(1000);
        this.base.setStrokeStyle(3, 0x6666aa, 0.8);
        this.base.setScrollFactor(0);
        this.base.setVisible(false);

        // スティック
        this.stick = scene.add.circle(this.baseX, this.baseY, this.radius * 0.4, 0x6666aa, 0.8).setDepth(1001);
        this.stick.setStrokeStyle(2, 0x9999cc, 1);
        this.stick.setScrollFactor(0);
        this.stick.setVisible(false);

        this.setupInput();

        // Listen for resize events
        this.scene.scale.on('resize', this.onResize, this);
    }

    updateDimensions() {
        const width = this.scene.scale.width;
        const height = this.scene.scale.height;
        const minDim = Math.min(width, height);

        this.baseX = width * this.xPercent;
        this.baseY = height * this.yPercent;
        this.radius = minDim * this.radiusPercent;
    }

    onResize(gameSize) {
        if (this.destroyed) return;
        this.updateDimensions();
        this.updatePosition();
    }

    updatePosition() {
        if (this.destroyed) return;
        if (!this.base || !this.stick) return;
        if (!this.base.geom || !this.stick.geom) return;
        if (this.base) {
            this.base.setPosition(this.baseX, this.baseY);
            this.base.setRadius(this.radius);
        }
        if (this.stick) {
            this.stick.setPosition(this.baseX, this.baseY);
            this.stick.setRadius(this.radius * 0.4);
        }
        this.stickX = this.baseX;
        this.stickY = this.baseY;
    }

    setupInput() {
        // Store bound handlers for cleanup
        this.onPointerDown = (pointer) => {
            // Only respond if no joystick is active and touch is in left half
            if (this.pointerId === null && pointer.x < this.scene.scale.width / 2) {
                this.activate(pointer);
            }
        };

        this.onPointerMove = (pointer) => {
            // Only respond to the pointer that owns this joystick
            if (this.active && pointer.id === this.pointerId) {
                this.updateStick(pointer);
            }
        };

        this.onPointerUp = (pointer) => {
            // Only respond to the pointer that owns this joystick
            if (pointer.id === this.pointerId) {
                this.deactivate();
            }
        };

        this.scene.input.on('pointerdown', this.onPointerDown);
        this.scene.input.on('pointermove', this.onPointerMove);
        this.scene.input.on('pointerup', this.onPointerUp);
    }

    activate(pointer) {
        this.active = true;
        this.pointerId = pointer.id; // Lock to this specific pointer
        const px = pointer.x * this.inputScale + this.touchOffsetX;
        const py = pointer.y * this.inputScale + this.touchOffsetY;
        this.baseX = px;
        this.baseY = py;
        this.base.setPosition(this.baseX, this.baseY);
        this.stick.setPosition(this.baseX, this.baseY);
        this.base.setVisible(true);
        this.stick.setVisible(true);
    }

    updateStick(pointer) {
        const px = pointer.x * this.inputScale + this.touchOffsetX;
        const py = pointer.y * this.inputScale + this.touchOffsetY;
        const dx = px - this.baseX;
        const dy = py - this.baseY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > this.radius) {
            const angle = Math.atan2(dy, dx);
            this.stickX = this.baseX + Math.cos(angle) * this.radius;
            this.stickY = this.baseY + Math.sin(angle) * this.radius;
        } else {
            this.stickX = px;
            this.stickY = py;
        }

        this.stick.setPosition(this.stickX, this.stickY);
    }

    deactivate() {
        this.active = false;
        this.pointerId = null; // Release pointer lock
        this.base.setVisible(false);
        this.stick.setVisible(false);
        this.stickX = this.baseX;
        this.stickY = this.baseY;
    }

    getDirection() {
        if (!this.active) return { x: 0, y: 0 };

        const dx = this.stickX - this.baseX;
        const dy = this.stickY - this.baseY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.radius * 0.2) return { x: 0, y: 0 };

        return {
            x: dx / this.radius,
            y: dy / this.radius
        };
    }

    destroy() {
        this.destroyed = true;
        // Remove resize listener
        this.scene.scale.off('resize', this.onResize, this);

        // Remove input handlers
        this.scene.input.off('pointerdown', this.onPointerDown);
        this.scene.input.off('pointermove', this.onPointerMove);
        this.scene.input.off('pointerup', this.onPointerUp);

        // Destroy visual elements
        if (this.base) this.base.destroy();
        if (this.stick) this.stick.destroy();

        this.base = null;
        this.stick = null;
    }
}

class JumpButton {
    constructor(scene, options = {}) {
        this.scene = scene;
        this.destroyed = false;

        // Use percentage-based positioning
        const {
            xPercent = 0.88,
            yPercent = 0.85,
            radiusPercent = 0.06
        } = options;

        this.xPercent = xPercent;
        this.yPercent = yPercent;
        this.radiusPercent = radiusPercent;

        // Calculate actual positions
        this.updateDimensions();

        this.active = false;
        this.pressed = false;

        // ボタン背景
        this.button = scene.add.circle(this.x, this.y, this.radius, 0xffaa88, 0.7).setDepth(1000);
        this.button.setStrokeStyle(3, 0xff8866, 0.9);
        this.button.setScrollFactor(0);
        this.button.setInteractive();
        this.button.setVisible(false);

        // 肉球アイコン
        const iconScale = this.radius / 40; // Scale icon based on button size
        const icon = scene.add.container(this.x, this.y).setDepth(1001).setScrollFactor(0);
        const pad = scene.add.ellipse(0, 2 * iconScale, 12 * iconScale, 9 * iconScale, 0xff8866);
        const toe1 = scene.add.circle(-6 * iconScale, -4 * iconScale, 4 * iconScale, 0xff8866);
        const toe2 = scene.add.circle(0, -6 * iconScale, 4 * iconScale, 0xff8866);
        const toe3 = scene.add.circle(6 * iconScale, -4 * iconScale, 4 * iconScale, 0xff8866);
        icon.add([pad, toe1, toe2, toe3]);
        icon.setVisible(false);
        this.icon = icon;

        this.setupInput();

        // Listen for resize events
        this.scene.scale.on('resize', this.onResize, this);
    }

    updateDimensions() {
        const width = this.scene.scale.width;
        const height = this.scene.scale.height;
        const minDim = Math.min(width, height);

        this.x = width * this.xPercent;
        this.y = height * this.yPercent;
        this.radius = minDim * this.radiusPercent;
    }

    onResize(gameSize) {
        if (this.destroyed) return;
        this.updateDimensions();
        this.updatePosition();
    }

    updatePosition() {
        if (this.destroyed) return;
        if (this.button && this.button.geom) {
            this.button.setPosition(this.x, this.y);
            this.button.setRadius(this.radius);
        }
        if (this.icon && this.icon.list) {
            this.icon.setPosition(this.x, this.y);
            // Update icon scale
            const iconScale = this.radius / 40;
            this.icon.list.forEach((child, index) => {
                if (index === 0) { // pad
                    child.setSize(12 * iconScale, 9 * iconScale);
                    child.setPosition(0, 2 * iconScale);
                } else if (index === 1) { // toe1
                    child.setRadius(4 * iconScale);
                    child.setPosition(-6 * iconScale, -4 * iconScale);
                } else if (index === 2) { // toe2
                    child.setRadius(4 * iconScale);
                    child.setPosition(0, -6 * iconScale);
                } else if (index === 3) { // toe3
                    child.setRadius(4 * iconScale);
                    child.setPosition(6 * iconScale, -4 * iconScale);
                }
            });
        }
    }

    setupInput() {
        this.button.on('pointerdown', () => {
            this.pressed = true;
            this.button.setFillStyle(0xff8866, 0.9);
            this.button.setScale(0.95);
        });

        this.button.on('pointerup', () => {
            this.pressed = false;
            this.button.setFillStyle(0xffaa88, 0.7);
            this.button.setScale(1);
        });

        this.button.on('pointerout', () => {
            this.pressed = false;
            this.button.setFillStyle(0xffaa88, 0.7);
            this.button.setScale(1);
        });
    }

    isPressed() {
        return this.pressed;
    }

    show() {
        this.button.setVisible(true);
        this.icon.setVisible(true);
    }

    hide() {
        this.button.setVisible(false);
        this.icon.setVisible(false);
    }

    destroy() {
        this.destroyed = true;
        this.scene.scale.off('resize', this.onResize, this);
        if (this.button) this.button.destroy();
        if (this.icon) this.icon.destroy();
        this.button = null;
        this.icon = null;
    }
}

// デバイス検出
class DeviceDetector {
    static isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    static isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    static isPortrait() {
        return window.innerHeight > window.innerWidth;
    }

    static getOptimalSize() {
        const isMobile = this.isMobile();
        const isPortrait = this.isPortrait();

        if (isMobile && isPortrait) {
            // 縦画面モバイル
            return { width: 400, height: 700 };
        } else if (isMobile) {
            // 横画面モバイル
            return { width: 700, height: 400 };
        } else {
            // デスクトップ
            return { width: 800, height: 550 };
        }
    }

    static getUIScale() {
        const screenWidth = window.innerWidth;
        const minWidth = 320;
        const maxWidth = 1920;
        const ratio = (screenWidth - minWidth) / (maxWidth - minWidth);
        return Math.max(0.6, Math.min(1.2, 0.6 + ratio * 0.6));
    }
}

// レスポンシブマネージャー
class ResponsiveManager {
    constructor(scene) {
        this.scene = scene;
        this.isMobile = DeviceDetector.isMobile();
        this.isPortrait = DeviceDetector.isPortrait();
        this.uiScale = DeviceDetector.getUIScale();

        // 画面回転イベント
        window.addEventListener('orientationchange', () => {
            this.handleOrientationChange();
        });

        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    handleOrientationChange() {
        setTimeout(() => {
            this.isPortrait = DeviceDetector.isPortrait();
            this.scene.scale.resize(
                window.innerWidth,
                window.innerHeight
            );
            this.scene.events.emit('orientation-changed', this.isPortrait);
        }, 100);
    }

    handleResize() {
        this.uiScale = DeviceDetector.getUIScale();
        this.scene.events.emit('ui-scale-changed', this.uiScale);
    }

    getLayoutConfig() {
        if (this.isMobile && this.isPortrait) {
            return {
                type: 'portrait',
                gameWidth: 400,
                gameHeight: 700,
                roomLayout: 'vertical'
            };
        } else {
            return {
                type: 'landscape',
                gameWidth: 800,
                gameHeight: 550,
                roomLayout: 'horizontal'
            };
        }
    }
}

// Shared mobile control factory (GameScene via HUDScene and GatheringScene)
function createMobileControls(scene, options = {}) {
    const joystickOptions = options.joystick || {};
    const jumpOptions = options.jump || {};

    const joystick = new VirtualJoystick(scene, joystickOptions);
    const jumpBtn = new JumpButton(scene, jumpOptions);

    joystick.base.setVisible(true);
    joystick.stick.setVisible(true);
    jumpBtn.show();

    return { joystick, jumpBtn };
}

function updateMobileControlsForCamera(joystick, jumpBtn, camera, screenW, screenH) {
    if (!joystick || !jumpBtn || !camera) return;
    if (joystick.destroyed || jumpBtn.destroyed) return;
    if (!joystick.base || !joystick.base.geom || !joystick.stick || !joystick.stick.geom) return;
    if (!jumpBtn.button || !jumpBtn.button.geom) return;

    const minDim = Math.min(screenW, screenH);
    const zoom = camera.zoom || 1;
    joystick.inputScale = 1;

    const joyXPct = typeof joystick.xPercent === 'number' ? joystick.xPercent : 0.12;
    const joyYPct = typeof joystick.yPercent === 'number' ? joystick.yPercent : 0.85;
    const joyScreenX = screenW * joyXPct;
    const joyScreenY = screenH * joyYPct;
    const joyWorldPoint = camera.getWorldPoint(joyScreenX, joyScreenY);

    joystick.baseX = joyWorldPoint.x;
    joystick.baseY = joyWorldPoint.y;
    joystick.radius = (minDim * (joystick.radiusPercent || 0.08)) / zoom;
    joystick.updatePosition();

    const btnXPct = typeof jumpBtn.xPercent === 'number' ? jumpBtn.xPercent : 0.88;
    const btnYPct = typeof jumpBtn.yPercent === 'number' ? jumpBtn.yPercent : 0.85;
    const btnScreenX = screenW * btnXPct;
    const btnScreenY = screenH * btnYPct;
    const btnWorldPoint = camera.getWorldPoint(btnScreenX, btnScreenY);

    jumpBtn.x = btnWorldPoint.x;
    jumpBtn.y = btnWorldPoint.y;
    jumpBtn.radius = (minDim * (jumpBtn.radiusPercent || 0.06)) / zoom;
    jumpBtn.updatePosition();
}

function updateMobileControlsForScreen(joystick, jumpBtn, camera, screenW, screenH) {
    if (!joystick || !jumpBtn) return;
    if (joystick.destroyed || jumpBtn.destroyed) return;
    if (!joystick.base || !joystick.base.geom || !joystick.stick || !joystick.stick.geom) return;
    if (!jumpBtn.button || !jumpBtn.button.geom) return;

    const minDim = Math.min(screenW, screenH);
    joystick.inputScale = 1;

    const joyXPct = typeof joystick.xPercent === 'number' ? joystick.xPercent : 0.12;
    const joyYPct = typeof joystick.yPercent === 'number' ? joystick.yPercent : 0.85;
    const joyScreenX = screenW * joyXPct;
    const joyScreenY = screenH * joyYPct;

    joystick.baseX = joyScreenX;
    joystick.baseY = joyScreenY;
    joystick.radius = minDim * (joystick.radiusPercent || 0.08);
    joystick.updatePosition();

    const btnXPct = typeof jumpBtn.xPercent === 'number' ? jumpBtn.xPercent : 0.88;
    const btnYPct = typeof jumpBtn.yPercent === 'number' ? jumpBtn.yPercent : 0.85;
    const btnScreenX = screenW * btnXPct;
    const btnScreenY = screenH * btnYPct;

    jumpBtn.x = btnScreenX;
    jumpBtn.y = btnScreenY;
    jumpBtn.radius = minDim * (jumpBtn.radiusPercent || 0.06);
    jumpBtn.updatePosition();
}
