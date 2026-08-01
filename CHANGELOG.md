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
- **Map Editor Zoom/Pan:** Implemented absolute CSS transform-based panning via right-click and dynamic scroll-wheel zoom centering in `MapEditor.tsx`, bypassing native scroll limits for full 2D camera freedom. Fixed layout overflow preventing bottom UI elements from rendering properly.
- **Gameplay Camera & Lighting:** Decreased character scale to 150, increased camera zoom to 0.7, and boosted ambient light intensity to 0.9 for better visibility and framing during gameplay.
- **Map Assets:** Updated map JSON and image assets in `public/mapas/`.
