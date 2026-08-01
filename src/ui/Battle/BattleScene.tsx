import React, { useEffect, useState } from 'react';
import { OrthographicCamera, Html, Plane } from '@react-three/drei';
import * as THREE from 'three';
import { battleManager } from '../../game/ecs/BattleManager';
import { GlbCharacterModel } from '../MapTester/GlbCharacterModel';
import { Team, GridLine } from '../../game/ecs/components/GridPosition';

export default function BattleScene({ mapImageUrl }: { mapImageUrl: string }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    // Force re-render when battle state changes
    battleManager.setOnStateChange(() => setTick(t => t + 1));
    return () => battleManager.setOnStateChange(() => {});
  }, []);

  const getPosition = (team: Team, line: GridLine, row: number): [number, number, number] => {
    // team A (Player): Bottom-Right area (x > 0, z > 0)
    // team B (Enemy): Top-Left area (x < 0, z < 0)
    
    const xBase = team === Team.A ? 120 : -120;
    const zBase = team === Team.A ? 120 : -120;
    
    const xLineOffset = team === Team.A ? (line === GridLine.BACK ? 60 : 0) : (line === GridLine.BACK ? -60 : 0);
    const zLineOffset = team === Team.A ? (line === GridLine.BACK ? 60 : 0) : (line === GridLine.BACK ? -60 : 0);
    
    // Diagonal perpendicular spread for rows (0 to 4)
    const rowOffset = row - 2; 
    const xRow = rowOffset * 40;
    const zRow = rowOffset * -40;
    
    const x = xBase + xLineOffset + xRow;
    const z = zBase + zLineOffset + zRow;
    
    return [x, 0, z]; 
  };

  return (
    <>
      <OrthographicCamera 
        makeDefault 
        position={[0, 400, 600]} 
        rotation={[-Math.PI / 6, 0, 0]} // Pitched down 30 degrees
        zoom={0.85}
        near={-2000} 
        far={2000} 
      />
      
      <ambientLight intensity={1.2} />
      <directionalLight 
        position={[100, 300, 200]} 
        intensity={1.8} 
        castShadow 
      />

      {/* Dimmed Map Background (Texture would be flat on the screen, but here we render a large floor plane) */}
      <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2000, 2000]} />
        <meshBasicMaterial color="#1a1a24" />
      </mesh>

      {/* Render Entities */}
      {battleManager.entities.map(entity => {
        if (entity.stats!.combat.currentHp <= 0) return null; // Dead

        const [x, y, z] = getPosition(
          entity.gridPosition!.team, 
          entity.gridPosition!.line, 
          (entity.gridPosition as any).slot
        );
        
        const isPlayer = entity.gridPosition!.team === Team.A;
        const scale = isPlayer ? 150 : 180;
        
        // Face the opposing team diagonally
        const rotationY = isPlayer ? -Math.PI * 0.75 : Math.PI * 0.25; 
        
        const assetPath = (entity as any).assetPath;
        const colorOverride = (entity as any).colorOverride;
        const animState = (battleManager as any).entityAnimations?.[entity.id] || 'idle_battle';

        const hpPct = Math.max(0, entity.stats!.combat.currentHp / entity.stats!.combat.maxHp) * 100;
        const atbPct = Math.min(100, ((entity.atb?.value || 0) / 1000) * 100);

        return (
          <group key={entity.id} position={[x, y, z]}>
            <group scale={[scale, scale, scale]} rotation={[0, rotationY, 0]}>
              <GlbCharacterModel
                characterId={assetPath.replace('.glb', '').replace('/characters/', '')}
                animationName={animState}
                colorOverride={colorOverride}
              />
            </group>
            
            {/* Simple shadow under character */}
            <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={120}>
               <planeGeometry args={[0.5, 0.25]} />
               <meshBasicMaterial color="black" transparent opacity={0.4} />
            </mesh>

            {/* Floating UI (Name, HP, ATB) */}
            <Html position={[0, 110, 0]} center style={{ pointerEvents: 'none', width: '80px', zIndex: 20 }}>
              <div className="flex flex-col items-center">
                <span 
                  className="text-[11px] font-bold text-white mb-0.5" 
                  style={{ textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000' }}
                >
                  {entity.name}
                </span>
                {/* HP Bar */}
                <div className="w-full bg-gray-900 border border-black/80 h-1.5 rounded-sm overflow-hidden mb-[1px]">
                  <div className="bg-green-500 h-full" style={{ width: `${hpPct}%` }} />
                </div>
                {/* ATB Bar */}
                <div className="w-full bg-gray-900 border border-black/80 h-1 rounded-sm overflow-hidden">
                  <div className="bg-yellow-400 h-full transition-all duration-75" style={{ width: `${atbPct}%` }} />
                </div>
              </div>
            </Html>
          </group>
        );
      })}
    </>
  );
}
