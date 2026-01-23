# Session Learnings

This game mixes fixed world coordinates (800x550) with variable screen sizes across PC, mobile portrait, and mobile landscape. Most past bugs were caused by mixing coordinate spaces and camera transforms. Use these notes to avoid repeating mistakes.

## Camera and Coordinate Space
- **Do not mix world-space and screen-space UI.** If a UI element uses `setScrollFactor(0)`, it is screen-space. Do not place it using `camera.getWorldPoint`. Use screen percentages and update on resize.
- **When camera zoom ≠ 1, input coordinates must be scaled.** Pointer coords are screen-space; if your UI is positioned in world units with zoom, multiply pointer coords by `1/zoom` before using them for hit tests.
- **If you want the world centered on any screen size, prefer `removeBounds()` + `centerOn()` over manual scroll.** `setBounds()` will clamp scroll and can cause the world to “stick” to an edge when the screen is larger than the world.
- **Never assume the world is visible 1:1 on mobile landscape.** Horizontal phones often produce a visible width larger than 800, which reveals coordinate mistakes.

## Mobile Controls (Joystick/Jump)
- **Keep mobile controls in a single coordinate system.** We now use screen-space controls with percent-based positions, updated via a dedicated helper.
- **Don’t reuse `updateMobileControlsForCamera()` for screen-space UI.** It converts screen→world and will misalign touch areas if `scrollFactor(0)` is set.
- **Guard against resize after destroy.** Resize events fire after scenes are torn down; always check `destroyed` flags and `geom` existence before setting radius/position.

## Stage Layout and Collision Alignment
- **Spawn the player based on actual platform geometry, not magic numbers.** Example: for Gathering, compute floor top from the platform list and set cat Y accordingly.
- **Verify visual floors match physics floors.** If you draw a floor for visuals and use a different platform for collision, expect visible “floating” or stuck characters.
- **If collision feels “off,” inspect camera zoom and scale first.** Many collision mismatches were actually camera transform mismatches.

## Responsive Differences (PC vs Mobile)
- **PC (landscape) usually runs near 1:1 zoom.** Layout bugs that appear only on mobile are often zoom-related.
- **Mobile portrait** tends to show a tall view; items with fixed X/Y often look offset. Always use responsive helpers for UI text (stage name, timers).
- **Mobile landscape** often breaks manual scroll math. Use camera centering and let the game world float inside the screen rather than clamping to bounds.

## Quick Checklist Before Shipping Changes
- [ ] Verify controls in PC + mobile portrait + mobile landscape.
- [ ] Check that UI is in screen-space or world-space, not both.
- [ ] If zoom changes, confirm pointer→world scaling for any input logic.
- [ ] Ensure camera centering uses `centerOn()` and avoids bounds clamp when screen is larger than world.
- [ ] Verify spawn positions against the actual collision platforms.
