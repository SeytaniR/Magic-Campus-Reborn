import { create } from 'zustand';
import { checkCollision, checkPortal } from './physics';
import { MapConfig } from '../types/map';

interface GameState {
  player: {
    x: number;
    y: number;
    isMoving: boolean;
    direction: number; // Angle in radians
  };
  mapData: MapConfig | null;
  mapImageSize: { width: number, height: number };
  activePortal: any | null;
  spawnedPortalId: number | null;
  devCharacterClass: string;
  devAnimation: string;
  setMapData: (data: MapConfig, width: number, height: number, targetPortalId?: number) => void;
  movePlayer: (dx: number, dy: number) => void;
  setPlayerPosition: (x: number, y: number) => void;
  setActivePortal: (portalData: any | null) => void;
  ignoreCurrentPortal: () => void;
  setDevCharacterClass: (charClass: string) => void;
  setDevAnimation: (anim: string) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  player: {
    x: 0,
    y: 0,
    isMoving: false,
    direction: 0,
  },
  mapData: null,
  mapImageSize: { width: 0, height: 0 },
  activePortal: null,
  spawnedPortalId: null,
  devCharacterClass: 'M2lutador',
  devAnimation: 'idle_normal',
  setActivePortal: (portalData) => set({ activePortal: portalData }),
  ignoreCurrentPortal: () => set(state => ({
    spawnedPortalId: state.activePortal?.portalId ?? null,
    activePortal: null
  })),
  setDevCharacterClass: (devCharacterClass) => set({ devCharacterClass }),
  setDevAnimation: (devAnimation) => set({ devAnimation }),
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

    set({ 
      mapData: data, 
      mapImageSize: { width, height },
      player: { x: spawnX, y: spawnY, isMoving: false, direction: 0 },
      activePortal: null,
      spawnedPortalId: targetPortalId !== undefined ? targetPortalId : null
    });
  },
  movePlayer: (dx, dy) => {
    const { player, mapData } = get();
    if (!mapData) return;

    const speed = 8;
    const newX = player.x + dx * speed;
    const newY = player.y + dy * speed;
    
    let isMoving = dx !== 0 || dy !== 0;

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

    // Check collision
    if (!checkCollision(newX, newY, mapData.polygons)) {
      set({ 
        player: { 
          ...player, 
          x: newX, 
          y: newY, 
          isMoving: dx !== 0 || dy !== 0,
          direction: Math.atan2(dy, dx)
        } 
      });
    } else {
      // Try sliding along walls
      if (!checkCollision(newX, player.y, mapData.polygons)) {
        set({ 
          player: { ...player, x: newX, isMoving: true, direction: dx > 0 ? 0 : Math.PI } 
        });
      } else if (!checkCollision(player.x, newY, mapData.polygons)) {
        set({ 
          player: { ...player, y: newY, isMoving: true, direction: dy > 0 ? Math.PI/2 : -Math.PI/2 } 
        });
      } else {
        set({ player: { ...player, isMoving: false } });
      }
    }
  },
  setPlayerPosition: (x, y) => set(state => ({ player: { ...state.player, x, y } })),
}));
