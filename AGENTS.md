# Magic Campus Remake - AI Developer Guidelines

These rules MUST be strictly followed by any AI Developer working on this project.

## Core Architecture
- **Full-Stack Split**: The project uses Node.js for the authoritative server and React for the client interface.
- **Modularity**: The entire project must use ES6 Modules and an Entity Component System (ECS) architecture. All ECS logic MUST be pure TypeScript, completely decoupled from React or WebGL, ensuring direct portability to the Node.js backend.
- **Server Authority**: The server is STRICTLY authoritative to prevent cheating. The client side is purely visual and sends input to the server.
- **Database**: MongoDB will be used for production. For initial validation, simulated persistence (e.g., in-memory server state or mock local storage logic) can be used, but the architecture must be designed to plug into MongoDB.

## Graphics & Rendering
- **GPU Acceleration**: All in-game graphics must be directed to the device's GPU (using WebGL, Three.js, Canvas, etc.).
- **Assets Integration**: The system must support loading PNG maps alongside JSON files for collision points, transparency, and map effects. It must also support 3D `.glb` models with animations for characters, monsters, pets, and NPCs.

## UI / UX & Responsiveness
- **Mobile-First & Fluid Layouts**: All layouts, HUDs, interfaces, buttons, and visual resources MUST follow absolute rules of fluidity and responsiveness.
- **Scaling**: Everything must stretch and shrink proportionally based on the device's screen resolution.
- **Prevention**: Avoid overlaps, clipping, cut-offs, or hidden elements. Maintain correct proportions on all screens.
- **Touch Support**: Ensure the entire experience is optimized for touch screens.

## Localization (i18n)
- **English First**: All strings, code, UI text, item names, and interfaces MUST be written in English.
- **i18n Ready**: Wrap all user-facing text in an i18n system for future translation. (Even if user instructions are in Portuguese, the generated code and strings must be in English).

## Documentation Discipline
- **`changelogs.md`**: Must be updated on every modification. Include a version number and a summary of what was adjusted.
- **`arquitetura.md`**: Must reflect the current folder structure and file connections. The AI Developer MUST keep this updated whenever new modules or systems are added.
