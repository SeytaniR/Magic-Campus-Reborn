# Project Architecture: Magic Campus Remake

This document outlines the planned directory structure and architectural design of the project. It must be continuously updated as the project evolves.

## Overview
The project is a full-stack JavaScript/TypeScript application. It utilizes a **Node.js (Express) authoritative server** and a **React-based client** for UI and rendering. The core game logic relies on an **Entity Component System (ECS)** architecture, completely separating data (components) from logic (systems).

## Directory Structure (Current & Planned)

```text
/
├── AGENTS.md            # AI developer rules and project guidelines.
├── arquitetura.md       # This file. Architectural overview.
├── changelogs.md        # Version history and project adjustments.
├── package.json         # Project dependencies, build, and dev scripts.
├── vite.config.ts       # Vite bundler configuration.
├── src/                 # Client-side source code (React & WebGL).
│   ├── App.tsx          # Main React application component (UI layers).
│   ├── types/           # Global TypeScript type definitions.
│   │   └── map.ts       # Map configuration and polygon types.
│   ├── game/            # Client-side Game engine (ECS, Rendering).
│   │   ├── ecs/         # Client Entity Component System implementation.
│   │   ├── rendering/   # GPU-accelerated rendering pipelines (WebGL/Three.js).
│   │   ├── assets/      # Loaders for PNG maps, JSON data, and GLB models.
│   │   ├── physics.ts   # Client-side 2D polygon collision & overlay detection.
│   │   └── store.ts     # Zustand store for client game state & physics sync.
│   ├── ui/              # Responsive React components (HUD, Menus, Windows).
│   │   ├── MapEditor/   # Visual map mapping tool for developers.
│   │   └── MapTester/   # 2.5D WebGL Map Test Environment (Three.js/Fiber).
│   ├── i18n/            # Internationalization dictionaries (English base).
│   └── main.tsx         # React DOM entry point.
└── server/              # Server-side source code (Authoritative).
    ├── server.ts        # Node.js/Express entry point and WebSocket setup.
    ├── ecs/             # Server-side ECS (Authoritative game logic).
    ├── network/         # WebSocket handlers and state synchronization.
    └── db/              # Database models and abstract persistence layers (MongoDB prep).
```

## Communication Flow & Architecture Logic
1. **Client -> Server**: The React/WebGL client captures user input (joystick, touch, clicks) and sends intent messages (e.g., "request move to X,Y", "cast spell") to the server via WebSockets.
2. **Server (Authoritative)**: The server receives inputs, validates them, and processes them through its internal ECS tick loop (handling physics, collisions via JSON maps, and stats).
3. **Server -> Client**: The server broadcasts the updated, authoritative world state to the connected clients.
4. **Client (Visual)**: The client's ECS interpolates the incoming state data, updates the 3D `.glb` model animations, renders the 2D PNG maps onto the GPU, and updates the React-based responsive HUD.
