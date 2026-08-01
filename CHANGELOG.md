# Changelog

## [Unreleased]
### Fixed
- **3D Character Rendering (WASM crash):** Replaced corrupted `basis_transcoder.wasm` in `public/basis/` with the correct Three.js 0.185.1 version to prevent Emscripten fatal load errors.
- **Animation Bug (T-Pose):** Fixed `useAnimations` root ref binding in `GlbCharacterModel.tsx` by unconditionally rendering the group tag.
- **Character Scale:** Increased character scale from 50 to 200 in `GenericCharacter.tsx` to properly fit the isometric map perspective under an Orthographic Camera.
- **Z-Fighting / Head Clipping:** Moved the character's base Z position from 20 to 200 to prevent the top of the character's head from clipping into the Z=0 map background plane during animations.
- **Transparency on Overlays:** Cloned materials deeply in `GlbCharacterModel.tsx` and enabled `transparent = true` to allow dynamic opacity interpolation when the player walks behind buildings.
- **Movement Direction Rotation:** Applied a `Math.PI / 2` offset to `rotation.y` in `GenericCharacter.tsx` so the character correctly faces the joystick/keyboard input direction.
- **Map Editor Loader:** Fixed a bug in `MapEditor.tsx` where loading a map JSON would crash due to a Vite SPA HTML fallback if the name was incorrect. The editor now gracefully validates the Content-Type and correctly updates the background image alongside the JSON.

### Added / Changed
- **ECS Combat Engine:** Implemented the core engine in pure TypeScript (`src/game/ecs/`).
  - **Components:** Added `Stats`, `GridPosition`, `ATB`, and `StatusEffects`.
  - **ATB System:** Implemented `ATBSystem` to manage time ticking based on Speed (+/- 5% RNG) and `ActionQueueSystem` for turn management.
  - **Combat System:** Implemented damage resolution, Armor mitigation formula (`1000 / 1000 + DEF`), Accuracy vs Evasion, Criticals, Double Strike, Counter Attacks, Taunt Interception (Cover), and Grid Range rules for Melees. Added Elemental damage multipliers and Flee calculations.
  - **Skills & AI:** Added `SkillSystem` to process turn-based effects (DoTs, Buff expiration) and `AISystem` for basic auto-targeting.
  - **Combat Simulator:** Created a console-based battle simulator (`test_combat.ts`) to validate the math without React dependencies.
- **Animation State Machine:** Implemented a robust semantic state machine in `store.ts` (`PlayerState`) replacing hardcoded animation names. Movement dynamically transitions states to 'moving', while idle states branch into 'idle_normal' or 'idle_battle' based on context.
- **Deterministic Animation Mixer:** Refactored `GlbCharacterModel.tsx` to use a manual `THREE.AnimationMixer` instead of `@react-three/drei`'s `useAnimations`. Separated character mesh and animation glb loading into independent effects to fix component unmounting/flickering and Drei caching bugs during crossfades.
- **Map Editor Zoom/Pan:** Implemented absolute CSS transform-based panning via right-click and dynamic scroll-wheel zoom centering in `MapEditor.tsx`, bypassing native scroll limits for full 2D camera freedom. Fixed layout overflow preventing bottom UI elements from rendering properly.
- **Gameplay Camera & Lighting:** Decreased character scale to 150, increased camera zoom to 0.7, and boosted ambient light intensity to 0.9 for better visibility and framing during gameplay.
- **Map Assets:** Updated map JSON and image assets in `public/mapas/`.

### Fixed
- **Direction Reset Bug:** Fixed a bug in `store.ts` where stopping movement (`dx=0, dy=0`) would reset the character's facing direction to angle 0 (right). The character now preserves its last known orientation when idle.
