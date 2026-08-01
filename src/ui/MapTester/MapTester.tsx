import React, { useEffect, useState, useRef } from 'react';
import { Play, Settings, X } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import GameScene from './GameScene';
import VirtualJoystick from './VirtualJoystick';
import { useGameStore, PlayerState } from '../../game/store';
import BattleScene from '../Battle/BattleScene';
import BattleUI from '../Battle/BattleUI';
import { battleManager } from '../../game/ecs/BattleManager';

const CHARACTERS = [
  { id: 'M2lutador', name: 'Lutador Artista' },
  { id: 'M2atirador', name: 'Atirador Mágico' },
  { id: 'M2medica', name: 'Médica Feiticeira' },
  { id: 'M2cacadora', name: 'Caçadora do Sol' },
  { id: 'M2musica', name: 'Música Espiritual' },
  { id: 'M2soldado', name: 'Soldado Engenheiro' }
];

const STATES: PlayerState[] = [
  'idle',
  'moving',
  'attacking',
  'hit',
  'dead',
  'revived',
  'consuming'
];

export default function MapTester() {
  const { setMapData, movePlayer, player, activePortal, mapData, devCharacterClass, setDevCharacterClass, setPlayerState, setPlayerInBattle } = useGameStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMapName, setCurrentMapName] = useState('izumo');
  const [isDevMenuOpen, setIsDevMenuOpen] = useState(false);
  
  const moveState = useRef({ dx: 0, dy: 0, active: false });

  const loadMap = async (mapName: string, targetPortalId?: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/mapas/${mapName}.json`);
      if (!response.ok) throw new Error(`Failed to load ${mapName}.json`);
      const data = await response.json();
      
      const img = new Image();
      img.src = `/mapas/${mapName}.jpg`;
      img.onload = () => {
        setMapData(data, img.width, img.height, targetPortalId);
        setCurrentMapName(mapName);
        setLoading(false);
      };
      img.onerror = () => {
        throw new Error(`Failed to load ${mapName}.jpg`);
      };
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Game loop for movement
  useEffect(() => {
    let animationFrame: number;
    const loop = () => {
      movePlayer(moveState.current.dx, moveState.current.dy);
      animationFrame = requestAnimationFrame(loop);
    };
    animationFrame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrame);
  }, [movePlayer]);

  useEffect(() => {
    loadMap('izumo');
  }, []); // Run only once on mount

  const battleStartedRef = useRef(false);

  // Watch for battle trigger
  useEffect(() => {
    if (player.inBattle && !battleStartedRef.current) {
      battleStartedRef.current = true;
      battleManager.startBattle(devCharacterClass);
      
      battleManager.setOnBattleEnd((victory) => {
        setPlayerInBattle(false);
        battleStartedRef.current = false;
      });
    }
  }, [player.inBattle, devCharacterClass, setPlayerInBattle]);

  // Keyboard support for desktop testing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w') moveState.current = { dx: moveState.current.dx, dy: -1, active: true };
      if (e.key === 'ArrowDown' || e.key === 's') moveState.current = { dx: moveState.current.dx, dy: 1, active: true };
      if (e.key === 'ArrowLeft' || e.key === 'a') moveState.current = { dx: -1, dy: moveState.current.dy, active: true };
      if (e.key === 'ArrowRight' || e.key === 'd') moveState.current = { dx: 1, dy: moveState.current.dy, active: true };
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w') moveState.current = { dx: moveState.current.dx, dy: 0, active: moveState.current.dx !== 0 };
      if (e.key === 'ArrowDown' || e.key === 's') moveState.current = { dx: moveState.current.dx, dy: 0, active: moveState.current.dx !== 0 };
      if (e.key === 'ArrowLeft' || e.key === 'a') moveState.current = { dx: 0, dy: moveState.current.dy, active: moveState.current.dy !== 0 };
      if (e.key === 'ArrowRight' || e.key === 'd') moveState.current = { dx: 0, dy: moveState.current.dy, active: moveState.current.dy !== 0 };
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleJoystickMove = (dx: number, dy: number) => {
    moveState.current = { dx, dy, active: true };
  };

  const handleJoystickStop = () => {
    moveState.current = { dx: 0, dy: 0, active: false };
    movePlayer(0, 0); // Force stop to update state
  };

  const handleTeleport = () => {
    if (activePortal && activePortal.portalType === 'teleport') {
      // Force release keys/joystick
      moveState.current = { dx: 0, dy: 0, active: false };
      movePlayer(0, 0);

      const targetMapFile = activePortal.targetMap;
      const targetMapName = targetMapFile.replace('.jpg', '').replace('.json', '');
      loadMap(targetMapName, activePortal.targetPortalId);
    }
  };

  const getMapFriendlyName = (filename: string) => {
    if (filename === 'izumo.jpg') return 'Vila Izumo';
    if (filename === 'suburbioleste.jpg') return 'Subúrbio Leste';
    if (filename === 'pantanaldasnuvens.jpg') return 'Pantanal das Nuvens';
    if (filename === 'dongxuen.jpg') return 'Dong Xuen';
    if (filename === 'espacozen.jpg') return 'Espaço Zen';
    return filename.replace('.jpg', '').replace('.json', '');
  };

  if (loading) return <div className="flex w-full h-full items-center justify-center bg-gray-950 text-white">Loading Map...</div>;
  if (error) return <div className="flex w-full h-full items-center justify-center bg-gray-950 text-red-500">Error: {error}</div>;

  return (
    <div className="relative w-full h-full bg-gray-950 touch-none overflow-hidden">
      <div className="absolute inset-0 z-10 pointer-events-none">
        <Canvas shadows={{ type: THREE.PCFShadowMap as any }}>
          {player.inBattle ? (
            <BattleScene mapImageUrl={`/mapas/${currentMapName}.jpg`} />
          ) : (
            <GameScene imageUrl={`/mapas/${currentMapName}.jpg`} />
          )}
        </Canvas>
      </div>

      {player.inBattle && <BattleUI />}
      
      {/* HUD Layer (Only visible when not in battle) */}
      {!player.inBattle && (
        <div className="absolute top-4 left-4 z-10 pointer-events-none">
          <div className="bg-black/50 text-white px-4 py-2 rounded-lg backdrop-blur-md border border-white/10">
            <h1 className="font-bold text-lg">{mapData?.name || currentMapName}</h1>
            <p className="text-xs text-gray-300">Player: X: {Math.round(player.x)} | Y: {Math.round(player.y)}</p>
          </div>
        </div>
      )}

      {/* Dev Menu Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={() => setIsDevMenuOpen(true)}
          className="bg-black/50 text-white p-2 rounded-lg backdrop-blur-md border border-white/10 hover:bg-black/70 transition"
        >
          <Settings size={24} />
        </button>
      </div>

      {/* Dev Menu Panel */}
      {isDevMenuOpen && (
        <div className="absolute top-0 right-0 h-full w-80 bg-black/90 text-white p-6 border-l border-white/10 z-30 shadow-2xl overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Dev Mode Settings</h2>
            <button onClick={() => setIsDevMenuOpen(false)} className="text-gray-400 hover:text-white">
              <X size={24} />
            </button>
          </div>
          
          <div className="mb-6">
            <h3 className="text-sm text-gray-400 font-semibold uppercase tracking-wider mb-3">Character Class</h3>
            <div className="space-y-2">
              {CHARACTERS.map(char => (
                <button
                  key={char.id}
                  onClick={() => setDevCharacterClass(char.id)}
                  className={`w-full text-left px-3 py-2 rounded-md transition ${
                    devCharacterClass === char.id 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {char.name} <span className="text-xs opacity-50 ml-2">({char.id})</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm text-gray-400 font-semibold uppercase tracking-wider">State Test</h3>
              <label className="flex items-center gap-2 text-xs bg-white/10 px-2 py-1 rounded cursor-pointer hover:bg-white/20 transition">
                <input 
                  type="checkbox" 
                  checked={player.inBattle} 
                  onChange={(e) => setPlayerInBattle(e.target.checked)}
                  className="accent-red-500"
                />
                In Battle
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {STATES.map(state => (
                <button
                  key={state}
                  onClick={() => setPlayerState(state)}
                  className={`px-3 py-2 text-xs rounded-md transition text-center capitalize ${
                    player.state === state 
                      ? 'bg-green-600 text-white' 
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {state}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Virtual Joystick for Mobile */}
      {!player.inBattle && (
        <div className="absolute bottom-12 left-12 z-20 md:hidden">
          <VirtualJoystick onMove={handleJoystickMove} onStop={handleJoystickStop} />
        </div>
      )}

      {/* Desktop instructions */}
      {!player.inBattle && (
        <div className="absolute bottom-4 right-4 z-10 hidden md:block pointer-events-none">
          <div className="bg-black/50 text-white px-4 py-2 rounded-lg backdrop-blur-md border border-white/10 text-sm">
            Use WASD or Arrow Keys to move
          </div>
        </div>
      )}

      {/* Portal Prompt */}
      {!player.inBattle && activePortal && activePortal.portalType === 'teleport' && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <div className="bg-black/80 backdrop-blur-md p-6 rounded-xl border border-white/20 shadow-2xl flex flex-col items-center gap-4">
            <h2 className="text-white text-xl font-bold text-center">
              Deseja ir para {getMapFriendlyName(activePortal.targetMap)}?
            </h2>
            <div className="flex gap-4 w-full">
              <button 
                className="flex-1 px-4 py-2 bg-white text-black font-bold rounded hover:bg-gray-200 transition-colors"
                onClick={handleTeleport}
              >
                Sim
              </button>
              <button 
                className="flex-1 px-4 py-2 bg-gray-700 text-white font-bold rounded hover:bg-gray-600 transition-colors"
                onClick={() => {
                   useGameStore.getState().ignoreCurrentPortal();
                }}
              >
                Não
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
