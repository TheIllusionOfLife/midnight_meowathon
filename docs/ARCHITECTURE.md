# Architecture Documentation

## Overview
**Cat Zoomies** is a static web application built with **Phaser 3**. It eschews external asset dependencies (images/spritesheets) in favor of **runtime procedural generation** via the Canvas API (Phaser Graphics). This ensures a small footprint and distinct visual style.

## Technology Stack
- **Engine**: [Phaser 3](https://phaser.io/) (v3.55+) - Physics, rendering, and scene management.
- **Language**: Vanilla JavaScript (ES6 Modules) - No transpilation step required.
- **Testing**: Node.js + [JSDOM](https://github.com/jsdom/jsdom) (simulated browser environment).
- **CI/CD**: GitHub Actions (Automated tests on push).

## Directory Structure
```
/
├── index.html          # Entry point, Phaser configuration
├── css/
│   └── styles.css      # UI overlay styles
├── js/
│   ├── scenes/         # Phaser Scene classes
│   │   ├── TitleScene.js
│   │   ├── GameScene.js      # Main gameplay loop
│   │   ├── PowerUpScene.js   # Roguelite selection
│   │   └── GatheringScene.js # Cat gathering mode
│   ├── textures.js     # Procedural asset generation logic
│   ├── roguelite.js    # Power-up and progression data
│   ├── stages.js       # Level layout definitions
│   ├── sound.js        # Audio synthesis (Oscillator)
│   ├── effects.js      # Particle and visual effects
│   └── mobile.js       # Touch control logic
└── tests/              # Node.js based runtime tests
```

## Core Systems

### 1. Scene Flow
- **TitleScene**: Entry point. Loads procedural textures.
- **GameScene**: The core action loop. Handles physics, input, and destruction logic.
- **PowerUpScene**: Interstitial scene. Triggered after level completion or failure(?). Allows picking upgrades.
- **GatheringScene**: A meta-progression room where players can view recruited cats.

### 2. Procedural Asset Generation (`js/textures.js`)
Instead of loading PNGs, the game generates `Phaser.Textures` at runtime:
1.  **Helper Functions**: `drawBezier`, `drawQuadratic`, `wobblyLine` provide a hand-drawn look.
2.  **Texture Cache**: Textures are generated once in `TitleScene` (or lazily) and stored in `this.textures`.
3.  **High DPI**: All procedural generation scales with `window.devicePixelRatio` for crisp rendering.

### 3. Roguelite System (`js/roguelite.js`)
- **PowerUpManager**: A global singleton (or persistent object) managing active buffs.
- **Buffs**: Defined as modifiers (e.g., `jumpMultiplier`, `noiseKiller`).
- **Trade-offs**: Power-ups often come with side effects (e.g., "High Jump" might increase "Noise on Land").

### 4. Audio (`js/sound.js`)
- Uses Web Audio API directly via Phaser (or custom wrapper) to synthesize sounds (Sine/Square waves) for retro SE without loading mp3/wav files.

## Technical Constraints
- **No External Images**: All visual assets must be drawn via code.
- **No Bundler**: Pure ES6 modules. No Webpack/Vite required for local dev (though standard HTTP server is needed).
- **Mobile First**: Touches are mapped to Virtual Joystick (`mobile.js`).
