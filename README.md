# 🐱 Cat Zoomies

**Cat Zoomies** is a cozy yet chaotic roguelite cat simulator. Play as a mischievous cat at midnight, breaking items to relieve stress while trying not to wake up your owner... too much.  
https://theillusionoflife.itch.io/cat-zoomies
![cat_zoomies_cover](https://github.com/user-attachments/assets/760935d9-75c0-4147-9f97-c22dce1757d5)


## 🎮 Features

*   **Satisfying Destruction**: Knock over vases, lamps, and clocks with physics-based interactions.
*   **Roguelite Progression**: After each round, choose from random Power-Ups (Catnip, Bell, Thunder, etc.) that grant buffs but come with trade-offs.
*   **"Midnight Cozy" Aesthetic**: Enjoy high-resolution, hand-drawn pixel art with atmospheric lighting (moonbeams, dust particles) and a soothing color palette.
*   **Combo System**: Chain your destruction together for massive score multipliers.
*   **Mobile Friendly**: Fully playable on mobile devices with an on-screen virtual joystick.

## 🕹️ Controls

### Desktop
*   **Move**: Arrow Keys or WASD
*   **Jump**: Spacebar or Up Arrow (Press again in mid-air for Double Jump!)
*   **Thunder Skill**: E Key (Requires Thunder Power-Up)

### Mobile
*   **Move**: Left Virtual Joystick
*   **Jump**: Right Jump Button

## 🛠️ Development

This game is built with **Phaser 3**. It is a pure static web application.

### Setup
1.  Clone the repository.
2.  Serve the root directory with any local web server (e.g., Live Server, `python -m http.server`, or `npm install -g http-server && http-server`).
3.  Open `index.html` in your browser.

### Build (itch.io)
Run the utility script to package the game for itch.io:
```bash
./build.sh
```
This creates `cat_zoomies.zip` with `index.html`, `css/`, and `js/`.
Note: Requires the `zip` command to be available on your system.

### Structure
*   `index.html`: Entry point and game configuration.
*   `css/`: Stylesheets.
*   `js/`: Game source code (modularized).
    *   `scenes/`: Phaser scenes (Title, Game, PowerUp, Gathering).
    *   `textures.js`: Procedural generation of hand-drawn assets.
    *   `roguelite.js`: Power-up and progression logic.

## 🌟 Credits

*   Engine: [Phaser 3](https://phaser.io/)
*   Fonts: [Google Fonts](https://fonts.google.com/) (Fredoka One, Kosugi Maru)
