import React from 'react';
import { OrthographicCamera } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { battleManager } from '../../game/ecs/BattleManager';
import { GlbCharacterModel } from '../MapTester/GlbCharacterModel';
import { Team, GridLine } from '../../game/ecs/components/GridPosition';

export const hudPositions: Record<string, { x: number, y: number }> = {};

export const getPosition = (team: Team, line: GridLine, row: number): [number, number, number] => {
  const xBase = team === Team.A ? 120 : -120;
  const zBase = team === Team.A ? 120 : -120;
  const xLineOffset = team === Team.A ? (line === GridLine.BACK ? 60 : 0) : (line === GridLine.BACK ? -60 : 0);
  const zLineOffset = team === Team.A ? (line === GridLine.BACK ? 60 : 0) : (line === GridLine.BACK ? -60 : 0);
  const rowOffset = row - 2; 
  const xRow = rowOffset * 40;
  const zRow = rowOffset * -40;
  return [xBase + xLineOffset + xRow, 0, zBase + zLineOffset + zRow]; 
};

function HUDProjector() {
  const { camera, size } = useThree();
  
  React.useEffect(() => {
    // We can update the hudPositions safely here without triggering a re-render
    // since the camera is static, we just need to do it once or when size changes.
    const updatePositions = () => {
      battleManager.entities.forEach(e => {
        if (!e.gridPosition) return;
        const [x, y, z] = getPosition(e.gridPosition.team, e.gridPosition.line, (e.gridPosition as any).slot);
        const pos = new THREE.Vector3(x, y + 110, z);
        pos.project(camera);
        hudPositions[e.id] = {
          x: (pos.x * 0.5 + 0.5) * size.width,
          y: (-(pos.y) * 0.5 + 0.5) * size.height
        };
      });
    };
    
    updatePositions();
    battleManager.addOnStateChange(updatePositions);
    return () => battleManager.removeOnStateChange(updatePositions);
  }, [camera, size]);

  return null;
}

export default function BattleScene({ mapImageUrl }: { mapImageUrl: string }) {

  return (
    <>
      <OrthographicCamera 
        makeDefault 
        position={[0, 400, 600]} 
        rotation={[-Math.PI / 6, 0, 0]} // Pitched down 30 degrees
        zoom={0.5}
        near={-2000} 
        far={2000} 
      />
      <HUDProjector />
      
      <ambientLight intensity={2.5} />
      <directionalLight 
        position={[100, 300, 200]} 
        intensity={3.0} 
      />

      {/* Dimmed Map Background */}
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
        const attackAnimation = (entity as any).attackAnimation;

        return (
          <group key={entity.id} position={[x, y, z]}>
            <group scale={[scale, scale, scale]} rotation={[0, rotationY, 0]}>
              <GlbCharacterModel
                characterId={assetPath.replace('.glb', '').replace('/characters/', '')}
                entityId={entity.id}
                colorOverride={colorOverride}
                attackAnimationOverride={attackAnimation}
              />
            </group>
            
            {/* Simple shadow under character */}
            <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={120}>
               <planeGeometry args={[0.5, 0.25]} />
               <meshBasicMaterial color="black" transparent opacity={0.4} />
            </mesh>
          </group>
        );
      })}
    </>
  );
}
