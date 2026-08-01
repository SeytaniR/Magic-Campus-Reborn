# Changelog

All notable changes to this project will be documented in this file.

## [0.4.1] - Performance, HUD Projection, and Crash Fixes
### Added
- Replaced computationally expensive 3D `<Html>` overlays in `BattleScene` with a 2D static projection system (`HUDProjector`) in `BattleUI`, significantly improving FPS on mobile devices (e.g., Redmi Note 14 Pro).
- Increased ambient and directional lighting intensity in `GameScene` and `BattleScene` to improve 3D model visibility.
- Adjusted camera zoom level to `0.5` uniformly across exploration and battle modes for better spatial awareness.
- Added a global console warning filter in `MapTester.tsx` to suppress expected and harmless warnings (`THREE.Clock` deprecation from R3F, and `THREE.PropertyBinding` from mismatched skeleton animations).
### Fixed
- Fixed fatal React crash caused by `GlbCharacterModel` throwing errors when 404ing on missing monster animations (e.g. `idle_battle.glb`). Error is now gracefully handled via console warnings.
- Fixed `AnimationMixer` initialization in `GlbCharacterModel` which was causing undefined reference exceptions during property binding.
- Fixed battle crash `battleManager.addOnStateChange is not a function` by renaming the incorrect base method `setOnStateChange` inside `BattleManager.ts`.
- Removed debug duplicate static mushrooms from the `GameScene` exploration map.
- Restored `dpr={[1, 1.5]}` in `<Canvas>` to ensure sharp, high-quality rendering without excessive performance penalty.

## [0.4.0] - Combat System Core, Isometric Battle UI, and GLTF Monsters
- Created `combat_system_design.md` to document the game's ATB, grid mechanics, elemental weaknesses, and formulas.
- Implemented core Combat ECS: `BattleManager`, `ATBSystem`, `ActionQueueSystem`, and `CombatSystem`.
- Added random distance-based encounters mapping to the battle scene.
- Added new GLTF loading logic with dynamic hue-shifting ShaderMaterial (`GlbCharacterModel`) to support recoloring monsters (e.g. Green = Earth, Red = Fire).
- Added `cogumelo.json` and mushroom models representing the first tier C monsters.
- Completely redesigned `BattleScene` and `BattleUI` to match classic *Magic Campus* Isometric 2.5D perspective:
  - Fixed camera pitch to 30 degrees (Isometric) with custom rotation alignment.
  - Enemy team rendered on the Top-Left diagonal, Player team on Bottom-Right diagonal.
  - Action Menu repositioned to vertical, right-aligned style.
  - Floating 3D HP/ATB/Name HUD over characters utilizing `@react-three/drei`'s `<Html>`.
### Fixed
- Fixed fatal battle crashes caused by unmapped `idle` animations triggering HTML fallback loads.
- Fixed UI disappearing bugs related to uninitialized `NaN` ATB max values.
- Centralized `<Canvas>` into `MapTester.tsx` to prevent `WebGLRenderer: Context Lost` errors when switching between Map and Battle scenes.

## [0.3.13] - Particle Effect Optimization
### Changed
- Reduced the particle count for the water/shimmer map effects by 50% to improve performance and visuals.
- Decreased the opacity of the map effect particles by 30% for a more subtle look.

## [0.3.12] - Pantanal das Nuvens Map Added
### Added
- Added the `pantanaldasnuvens.json` file for the new map "Pantanal das Nuvens", connecting it with Izumo and Espaço Zen.
- Added friendly name translation for "Espaço Zen" in the teleport modal.

## [0.3.11] - Portal Teleportation Logic
### Added
- Created the logic to teleport the player between maps when standing on a portal.
- Implemented a modal prompt asking "Deseja ir para <nome_do_mapa>?" when entering a portal.
- Added states to ignore portals until the player steps off them to prevent recursive teleportation.
- Mapped file names (e.g. `izumo.jpg`, `suburbioleste.jpg`) to friendly display names in the UI.

## [0.3.10] - Subúrbio Leste Map Added
### Added
- Created `suburbioleste.json` with the collision, overlay, effect, and portal polygons connecting to Izumo Village.

## [0.3.9] - Izumo Village Map Update
### Changed
- Updated `izumo.json` with the latest collision, overlay, effect, and portal polygons.

## [0.3.8] - Portals Map Overlay Effect
### Added
- Added an SVG-based animated pentagram effect to mark portals on the ground in the Map Tester. It slowly rotates, pulses, and transitions through strong neon colors.

## [0.3.7] - Scattered Particles Map Effect
### Changed
- Replaced the solid overlay water/crystal effects with a scattered particle system using a custom ShaderMaterial. The particles are dynamically generated inside the defined polygons to give a sparkling/shimmering look instead of a flashing solid mesh.

## [0.3.6] - Map Tester Adjustments
### Changed
- Changed Map Tester camera zoom from 1 to 0.5.
- Increased player movement speed from 5 to 8.

## [0.3.5] - Izumo Village Map Update
### Changed
- Updated `izumo.json` with the latest collision and overlay polygons.

## [0.3.4] - Features and Bug Fixes
### Added
- Added a "Download" button to the MapEditor allowing the user to directly download their configuration as a `.json` file for easier local saving.
- Re-named the internal map JSON to "Izumo Village" to support future i18n logic (translating the generic word 'Village').
### Fixed
- Fixed MapEffects geometry generating planes facing a single direction which resulted in them not being visible. Added `THREE.DoubleSide` and adjusted the Z-index grouping positioning.
- Restored the truncated polygons from the `izumo.json` payload, restoring collision areas and map data to their complete boundaries.

## [0.3.3] - Map Editor Drawing Fix
### Fixed
- Fixed the "Finish/Cancel" floating action bar becoming hidden by moving it out of the scrollable container and ensuring it remains fixed to the bottom of the visible workspace area, regardless of map scroll position.

## [0.3.2] - Tooling & Bug Fixes for Map Editor/Tester
### Fixed
- Fixed Map Editor zoom stopping at 80% due to floating point precision errors.
- Fixed inability to scroll down in Map Editor by replacing `transform: scale` with dynamic dimension scaling and `viewBox` projection.
- Fixed the issue where "Finish/Cancel" buttons would become inaccessible while drawing on mobile by introducing a floating action bar inside the workspace.
- Fixed drawing points displaying too large on the map; radius and stroke thickness were reduced for better mapping precision.
- Fixed the Water/Crystal overlay effect in the Map Tester not displaying properly against light backgrounds by reverting AdditiveBlending to standard Alpha blending.
- Fixed Map Editor failing to automatically load the existing `izumo.json` map file upon initial start by incorporating a fallback server fetch logic and a manual "Load Server" button.

## [0.3.1] - Map Editor Improvements & Map Tester Effects
### Changed
- Improved `MapEditor` map container logic. Replaced `transform: scale()` wrapper with direct dimension manipulation to resolve vertical scroll blocking and scrolling boundaries issues.
- Expanded zoom functionality in `MapEditor` allowing zoom out to 10% (0.1).
- Added a "Select/Edit Mode" toggle in `MapEditor` allowing users to draw overlapping shapes by disabling pointer-events on existing polygons when disabled.
- Added `MapEffects.tsx` to `MapTester` to render animated, pulsating 3D shapes representing `water` or `crystal` effect polygons on the map plane.

## [0.3.0] - Map Tester and 3D Rendering Integration
### Added
- Created `public/mapas/izumo.json` containing the polygon mapping data (collisions, overlays, portals, effects) mapped via the editor.
- Integrated `@react-three/fiber`, `@react-three/drei`, and `three` for GPU-accelerated 3D rendering of the map environment.
- Created `MapTester` environment containing:
  - `GameScene`: A WebGL canvas combining the 2D map texture onto a 3D Plane using an OrthographicCamera.
  - `GenericCharacter`: A generic 3D capsule mesh representing the player, featuring movement bobbing and overlay transparency handling.
  - `VirtualJoystick`: A custom, responsive on-screen joystick for mobile touch control.
- Added `src/game/physics.ts` implementing a Ray-Casting algorithm for point-in-polygon collision detection against the loaded map JSON boundaries.
- Added `src/game/store.ts` using `zustand` to manage the local authoritative game state (character position, movement vectors, collision sliding) for the client.
- Added a top navigation bar in `App.tsx` to seamlessly toggle between the Map Editor and the Map Tester modes.

## [0.2.1] - Mobile Responsiveness Update for Map Editor
### Changed
- Refactored `MapEditor` layout to be fully usable on mobile devices.
- Implemented collapsible sidebars (left for tools, right for properties) using absolute positioning on smaller screens.
- Added floating menu toggle buttons (`Menu` and `Settings`) for mobile views.
- Adjusted touch areas, button sizes, and padding for better ergonomics on touch screens.
- Improved the zoom controls layout to wrap and fit gracefully on narrow displays.

## [0.2.0] - Map Editor Tool Added
### Added
- Created `MapEditor` React component to visually map out 2D images (`.jpg`/`.png`).
- Tool supports creating polygons for `collision`, `portal` (teleport/spawn), `overlay`, `elevation`, and `effect` areas.
- Configurable global map properties (name, level, category, biome).
- Added direct JSON export functionality for engine consumption.

## [0.1.0] - Initial Documentation Setup
### Added
- `AGENTS.md`: Established strict AI developer guidelines regarding ECS architecture, server authority, GPU-accelerated rendering, mobile-first responsive UI, and i18n (English base).
- `arquitetura.md`: Defined the initial full-stack project structure, separating the React client and Node.js authoritative server.
- `changelogs.md`: Initialized version tracking to log all future modifications and adjustments.
- `metadata.json`: Updated app name and description to reflect the Magic Campus Remake project.
