// モバイル対応 - 仮想ジョイスティック、タッチ操作、レスポンシブ

class VirtualJoystick {
    constructor(scene, x, y, radius = 60) {
        this.scene = scene;
        this.radius = radius;
        this.baseX = x;
        this.baseY = y;
        this.stickX = x;
        this.stickY = y;
        this.active = false;
        this.pointer = null;

        // ベース円
        this.base = scene.add.circle(x, y, radius, 0x333366, 0.5).setDepth(1000);
        this.base.setStrokeStyle(3, 0x6666aa, 0.8);
        this.base.setScrollFactor(0);
        this.base.setVisible(false);

        // スティック
        this.stick = scene.add.circle(x, y, radius * 0.4, 0x6666aa, 0.8).setDepth(1001);
        this.stick.setStrokeStyle(2, 0x9999cc, 1);
        this.stick.setScrollFactor(0);
        this.stick.setVisible(false);

        this.setupInput();
    }

    setupInput() {
        this.scene.input.on('pointerdown', (pointer) => {
            // 左半分の画面でタッチ
            if (pointer.x < this.scene.scale.width / 2) {
                this.activate(pointer);
            }
        });

        this.scene.input.on('pointermove', (pointer) => {
            if (this.active && this.pointer === pointer) {
                this.updateStick(pointer);
            }
        });

        this.scene.input.on('pointerup', (pointer) => {
            if (this.pointer === pointer) {
                this.deactivate();
            }
        });
    }

    activate(pointer) {
        this.active = true;
        this.pointer = pointer;
        this.baseX = pointer.x;
        this.baseY = pointer.y;
        this.base.setPosition(this.baseX, this.baseY);
        this.stick.setPosition(this.baseX, this.baseY);
        this.base.setVisible(true);
        this.stick.setVisible(true);
    }

    updateStick(pointer) {
        const dx = pointer.x - this.baseX;
        const dy = pointer.y - this.baseY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > this.radius) {
            const angle = Math.atan2(dy, dx);
            this.stickX = this.baseX + Math.cos(angle) * this.radius;
            this.stickY = this.baseY + Math.sin(angle) * this.radius;
        } else {
            this.stickX = pointer.x;
            this.stickY = pointer.y;
        }

        this.stick.setPosition(this.stickX, this.stickY);
    }

    deactivate() {
        this.active = false;
        this.pointer = null;
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
        this.base.destroy();
        this.stick.destroy();
    }
}

class JumpButton {
    constructor(scene, x, y, radius = 40) {
        this.scene = scene;
        this.active = false;
        this.pressed = false;

        // ボタン背景
        this.button = scene.add.circle(x, y, radius, 0xffaa88, 0.7).setDepth(1000);
        this.button.setStrokeStyle(3, 0xff8866, 0.9);
        this.button.setScrollFactor(0);
        this.button.setInteractive();
        this.button.setVisible(false);

        // 肉球アイコン
        const icon = scene.add.container(x, y).setDepth(1001).setScrollFactor(0);
        const pad = scene.add.ellipse(0, 2, 12, 9, 0xff8866);
        const toe1 = scene.add.circle(-6, -4, 4, 0xff8866);
        const toe2 = scene.add.circle(0, -6, 4, 0xff8866);
        const toe3 = scene.add.circle(6, -4, 4, 0xff8866);
        icon.add([pad, toe1, toe2, toe3]);
        icon.setVisible(false);
        this.icon = icon;

        this.setupInput();
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
        this.button.destroy();
        this.icon.destroy();
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
