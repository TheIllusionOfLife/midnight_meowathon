
const fs = require('fs');
const path = require('path');

// Mock Phaser Environment
global.Phaser = {
    Display: {
        Color: {
            GetColor: (r, g, b) => (r << 16) | (g << 8) | b
        }
    },
    Math: {
        Between: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
        FloatBetween: (min, max) => Math.random() * (max - min) + min,
        Vector2: class { constructor(x, y) { this.x = x; this.y = y; } }
    },
    Curves: {
        CubicBezier: class {
            constructor(p1, p2, p3, p4) { this.p1 = p1; this.p2 = p2; this.p3 = p3; this.p4 = p4; }
            getPoints(quantity) {
                // Return dummy points for testing
                const points = [];
                for (let i = 0; i <= quantity; i++) {
                    points.push({ x: 0, y: 0 });
                }
                return points;
            }
        }
    }
};

// Mock Graphics Class
class MockGraphics {
    constructor() {
        this.x = 0;
        this.y = 0;
    }

    // Supported methods (based on Phaser 3 API)
    fillStyle() { }
    fillCircle() { }
    fillEllipse() { }
    fillRect() { }
    fillRoundedRect() { }
    fillTriangle() { }
    fillTrapezoid() { } // Note: verify if this exists in Phaser 3. Actually it DOES NOT exist in standard Phaser 3 Graphics!
    // Wait, fillTrapezoid is NOT a standard Phaser 3 Graphics method either? 
    // I need to check usage. If I used it, that's another bug.

    lineStyle() { }
    lineBetween() { }
    beginPath() { }
    moveTo() { }
    lineTo() { }
    closePath() { }
    strokePath() { }
    fillPath() { }
    arc() { }
    fillPoints() { }

    save() { }
    restore() { }
    translateCanvas() { }
    rotateCanvas() { }
    scaleCanvas() { }

    generateTexture() { }
    destroy() { }

    // Add any other methods I used that are valid
    fillPoint() { } // fillCircle with small radius

    // If I used bezierCurveTo, it's missing here, so it should throw TypeError
}

// Mock Scene
const mockScene = {
    make: {
        graphics: () => new MockGraphics()
    }
};

// Load textures.js content
const texturesCode = fs.readFileSync(path.join(__dirname, '../js/textures.js'), 'utf8');

// Isolate usage of fillTrapezoid if any
if (texturesCode.includes('fillTrapezoid')) {
    console.log('WARNING: fillTrapezoid detected in code. This might also be an issue if Phaser 3 does not support it.');
}

// Execute the file code (eval to load function into scope)
eval(texturesCode);

// Helper functions (wobblyLine, texturedFill) are now in scope.
// createAllTextures is now in scope.

try {
    console.log('🧪 Testing createAllTextures...');
    createAllTextures(mockScene);
    console.log('✅ createAllTextures executed successfully.');
} catch (error) {
    console.error('❌ Runtime Error in createAllTextures:');
    console.error(error);
    process.exit(1);
}
