import { create } from 'zustand';
import { checkCollision, checkPortal } from './physics';
import { MapConfig } from '../types/map';

export type PlayerState = 'idle' | 'moving' | 'attacking' | 'hit' | 'dead' | 'revived' | 'consuming';

interface GameState {
  player: {
    x: number;
    y: number;
    isMoving: boolean;
    direction: number; // Angle in radians
    state: PlayerState;
    inBattle: boolean;
    distanceTraveled: number;
    nextEncounterDistance: number;
  };
  mapData: MapConfig | null;
  mapImageSize: { width: number, height: number };
  activePortal: any | null;
  spawnedPortalId: number | null;
  devCharacterClass: string;
  setMapData: (data: MapConfig, width: number, height: number, targetPortalId?: number) => void;
  movePlayer: (dx: number, dy: number) => void;
  setPlayerPosition: (x: number, y: number) => void;
  setPlayerState: (state: PlayerState) => void;
  setPlayerInBattle: (inBattle: boolean) => void;
  setActivePortal: (portalData: any | null) => void;
  ignoreCurrentPortal: () => void;
  setDevCharacterClass: (charClass: string) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  player: {
    x: 0,
    y: 0,
    isMoving: false,
    direction: 0,
    state: 'idle',
    inBattle: false,
    distanceTraveled: 0,
    nextEncounterDistance: 1000 + Math.random() * 2000, // Random distance between 1000 and 3000 pixels
  },
  mapData: null,
  mapImageSize: { width: 0, height: 0 },
  activePortal: null,
  spawnedPortalId: null,
  devCharacterClass: 'M2lutador',
  setActivePortal: (portalData) => set({ activePortal: portalData }),
  ignoreCurrentPortal: () => set(state => ({
    spawnedPortalId: state.activePortal?.portalId ?? null,
    activePortal: null
  })),
  setDevCharacterClass: (devCharacterClass) => set({ devCharacterClass }),
  setPlayerState: (state) => set(s => ({ player: { ...s.player, state } })),
  setPlayerInBattle: (inBattle) => set(s => ({ player: { ...s.player, inBattle } })),
  setMapData: (data, width, height, targetPortalId) => {
    // Find spawn point
    let spawnX = 0;
    let spawnY = 0;
    
    let spawnPortal = null;
    if (targetPortalId !== undefined) {
      spawnPortal = data.polygons.find(p => p.type === 'portal' && p.portalData?.portalId === targetPortalId);
    }
    
    if (!spawnPortal) {
      spawnPortal = data.polygons.find(p => p.type === 'portal' && p.portalData?.portalType === 'spawn');
    }
    
    if (!spawnPortal) {
      spawnPortal = data.polygons.find(p => p.type === 'portal');
    }

    if (spawnPortal && spawnPortal.points.length > 0) {
      // Average points for spawn center
      spawnX = spawnPortal.points.reduce((acc, p) => acc + p.x, 0) / spawnPortal.points.length;
      spawnY = spawnPortal.points.reduce((acc, p) => acc + p.y, 0) / spawnPortal.points.length;
    }

    set(s => ({ 
      mapData: data, 
      mapImageSize: { width, height },
      player: { 
        ...s.player, 
        x: spawnX, 
        y: spawnY, 
        isMoving: false, 
        direction: 0,
        distanceTraveled: 0,
        nextEncounterDistance: 1000 + Math.random() * 2000
      },
      activePortal: null,
      spawnedPortalId: targetPortalId !== undefined ? targetPortalId : null
    }));
  },
  movePlayer: (dx, dy) => {
    const { player, mapData } = get();
    if (!mapData) return;

    let isMoving = dx !== 0 || dy !== 0;

    // Early return if already stopped to prevent unnecessary state updates
    if (!isMoving && !player.isMoving && player.state !== 'moving') {
      return;
    }
    
    // Disable movement if in battle
    if (player.inBattle) return;

    const speed = 8;
    const newX = player.x + dx * speed;
    const newY = player.y + dy * speed;

    // Portal check
    const portalData = checkPortal(newX, newY, mapData.polygons);
    
    const { spawnedPortalId, activePortal } = get();

    if (portalData && portalData.portalId === spawnedPortalId) {
      // Still inside the portal we spawned on, do nothing
    } else {
      // Left the spawned portal
      if (!portalData && spawnedPortalId !== null) {
         set({ spawnedPortalId: null });
      }
      
      if (activePortal !== portalData) {
         set({ activePortal: portalData });
      }
    }

    // Determine state based on movement
    const newState = isMoving ? 'moving' : (player.state === 'moving' ? 'idle' : player.state);

    // Check collision
    let finalX = player.x;
    let finalY = player.y;
    let actualIsMoving = false;
    let finalDirection = player.direction;
    
    if (!checkCollision(newX, newY, mapData.polygons)) {
      finalX = newX;
      finalY = newY;
      actualIsMoving = isMoving;
      finalDirection = isMoving ? Math.atan2(dy, dx) : player.direction;
    } else {
      // Try sliding along walls
      if (!checkCollision(newX, player.y, mapData.polygons)) {
        finalX = newX;
        actualIsMoving = true;
        finalDirection = dx > 0 ? 0 : Math.PI;
      } else if (!checkCollision(player.x, newY, mapData.polygons)) {
        finalY = newY;
        actualIsMoving = true;
        finalDirection = dy > 0 ? Math.PI/2 : -Math.PI/2;
      }
    }
    
    const finalState = actualIsMoving ? 'moving' : (player.state === 'moving' ? 'idle' : player.state);
    
    // Calculate distance for encounters
    let newDistanceTraveled = player.distanceTraveled;
    let newInBattle = player.inBattle;
    let newNextEncounter = player.nextEncounterDistance;
    
    if (actualIsMoving && mapData.category !== 'city') {
       const dist = Math.sqrt(Math.pow(finalX - player.x, 2) + Math.pow(finalY - player.y, 2));
       newDistanceTraveled += dist;
       
       if (newDistanceTraveled >= newNextEncounter) {
          newInBattle = true;
          newDistanceTraveled = 0;
          newNextEncounter = 1000 + Math.random() * 2000;
       }
    }

    set({ 
      player: { 
        ...player, 
        x: finalX, 
        y: finalY, 
        isMoving: actualIsMoving,
        direction: finalDirection,
        state: newInBattle ? 'idle' : finalState, // Stop moving anim if battle triggers
        inBattle: newInBattle,
        distanceTraveled: newDistanceTraveled,
        nextEncounterDistance: newNextEncounter
      } 
    });
  },
  setPlayerPosition: (x, y) => set(state => ({ player: { ...state.player, x, y } })),
}));
