# Contributing Guide

## Development Setup
1.  **Clone the Repo**:
    ```bash
    git clone https://github.com/TheIllusionOfLife/midnight_meowathon.git
    ```
2.  **Serve Locally**:
    This project uses ES Modules, so it must be served via a web server (not file://).
    ```bash
    npx http-server .
    # OR
    python -m http.server
    ```
3.  **Run Tests**:
    This project includes a Node.js-based test runner for logic verification.
    ```bash
    npm test
    ```

## Coding Standards
- **Language**: Modern JavaScript (ES6+).
- **Style**:
    - Use `const` and `let` (no `var`).
    - Use Arrow functions `() => {}` where appropriate.
    - Semicolons are preferred.
- **Architecture**:
    - **Logic/View Separation**: Keep game logic (scoring, physics) separate from pure visual effects where possible.
    - **No External Assets**: Do not add `.png` or `.mp3` files. All assets must be generated in `textures.js` or `sound.js`.

## Workflow
1.  Pick a task from `docs/ROADMAP.md` or create an issue.
2.  Create a feature branch (`feature/my-cool-feature`).
3.  Implement changes.
4.  Run `npm test` to ensure no regressions.
5.  Open a Pull Request.
