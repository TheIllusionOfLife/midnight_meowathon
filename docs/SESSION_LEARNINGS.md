# Session Learnings

- Camera zoom requires UI placement via camera world points to keep hit areas aligned.
- Mobile controls should be shared across modes and read joystick direction, not mode-specific flags.
- Resize callbacks can fire after destroy; guard on destroyed state and geometry existence.
- Background beams (moonlight) must stay anchored to window coordinates when layout shifts.
- User feedback highlights the need for clear mobile UX (controls, tips, and readable overlays).
