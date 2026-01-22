// 中央集権的なレスポンシブユーティリティ
// Centralized responsive utilities for mobile support

// FIXED GAME WORLD DIMENSIONS - these must stay constant for physics/game logic
const GAME_W = 800;
const GAME_H = 550;

const GameLayout = {
    // Scene reference for screen dimensions
    _scene: null,

    // Initialize with scene reference
    init(scene) {
        this._scene = scene;
    },

    // Get SCREEN dimensions (for UI scenes like TitleScene, PowerUpScene)
    get W() {
        return this._scene ? this._scene.scale.width : window.innerWidth;
    },

    get H() {
        return this._scene ? this._scene.scale.height : window.innerHeight;
    },

    // Alias for clarity
    get screenW() {
        return this.W;
    },

    get screenH() {
        return this.H;
    },

    // Fixed game world dimensions (for GameScene, GatheringScene)
    get gameW() {
        return GAME_W;
    },

    get gameH() {
        return GAME_H;
    },

    // Percentage-based positioning helpers (screen-relative)
    pctX(percent) {
        return this.W * percent;
    },

    pctY(percent) {
        return this.H * percent;
    },

    // Safe areas for mobile controls (avoid notches, rounded corners)
    get safeTop() {
        return this.pctY(0.05);
    },

    get safeBottom() {
        return this.H - this.pctY(0.05);
    },

    get safeLeft() {
        return this.pctX(0.05);
    },

    get safeRight() {
        return this.W - this.pctX(0.05);
    },

    // Mobile control positioning
    get controlsBottom() {
        return this.H - Math.min(100, this.pctY(0.15));
    },

    get controlsLeft() {
        return Math.min(80, this.pctX(0.12));
    },

    get controlsRight() {
        return this.W - Math.min(80, this.pctX(0.12));
    },

    // Responsive sizing (screen-relative scaling)
    scale(baseSize) {
        // Scale based on smaller dimension to maintain readability
        const minDim = Math.min(this.W, this.H);
        const baseDim = 550; // Original design height
        return baseSize * (minDim / baseDim);
    },

    // Font size scaling (returns number, caller adds 'px' if needed)
    fontSize(baseSize) {
        return Math.max(10, this.scale(baseSize));
    },

    // Check if portrait orientation
    get isPortrait() {
        return this.H > this.W;
    },

    // Check if landscape orientation
    get isLandscape() {
        return this.W >= this.H;
    },

    // Get aspect ratio
    get aspectRatio() {
        return this.W / this.H;
    },

    // Convert absolute coordinates to relative (for stage layouts)
    toRelativeX(absoluteX, baseWidth = 800) {
        return absoluteX / baseWidth;
    },

    toRelativeY(absoluteY, baseHeight = 550) {
        return absoluteY / baseHeight;
    },

    // Convert relative coordinates to absolute (current screen)
    fromRelativeX(relativeX) {
        return relativeX * this.W;
    },

    fromRelativeY(relativeY) {
        return relativeY * this.H;
    }
};

// CRITICAL: W and H must be FIXED 800x550 for game world consistency
// The game world (platforms, items, physics) was designed for these dimensions
// Changing these to screen dimensions breaks all the game content positioning
const W = GAME_W;
const H = GAME_H;
