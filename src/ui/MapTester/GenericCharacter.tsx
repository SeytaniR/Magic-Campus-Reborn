import React, { useRef, useEffect, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore, PlayerState } from '../../game/store';
import { getOverlayLevel } from '../../game/physics';
import * as THREE from 'three';
import { GlbCharacterModel } from './GlbCharacterModel';
import { ErrorBoundary } from './ErrorBoundary';

const resolveAnimation = (charClass: string, state: PlayerState, inBattle: boolean): string => {
  if (state === 'moving') return 'sprint';
  if (state === 'dead') return 'death';
  if (state === 'hit') return 'hit_chest';
  if (state === 'revived') return 'revive';
  if (state === 'consuming') return 'consume';
  
  if (state === 'attacking') {
    const rangedClasses = ['M2atirador', 'M2musica', 'M2medica'];
    if (rangedClasses.includes(charClass)) {
      return 'spell';
    } else {
      return 'sword_attack';
    }
  }
  
  // idle
  return inBattle ? 'idle_battle' : 'idle_normal';
};

export default function GenericCharacter() {
  const group = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const gltfGroupRef = useRef<THREE.Group>(null);
  
  const { player, mapData, devCharacterClass } = useGameStore();

  const currentAnimation = resolveAnimation(devCharacterClass, player.state, player.inBattle);

  useFrame(() => {
    if (!group.current) return;

    // The map is mapped to X and -Y (top-left is 0,0, Y goes down).
    // So character position is:
    group.current.position.set(player.x, -player.y, 0);

    // Rotate character to face correct direction (offset by 90 degrees)
    if (gltfGroupRef.current) {
      gltfGroupRef.current.rotation.y = Math.PI / 2 - player.direction;
    }

    // Check overlay transparency
    if (mapData) {
      const isUnderOverlay = getOverlayLevel(player.x, player.y, mapData.polygons);
      const targetOpacity = isUnderOverlay ? 0.3 : 1.0;
      
      if (gltfGroupRef.current) {
        gltfGroupRef.current.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            materials.forEach(mat => {
              if (mat) {
                mat.transparent = true;
                if (mat.opacity === undefined || isNaN(mat.opacity)) {
                  mat.opacity = 1.0;
                }
                mat.opacity += (targetOpacity - mat.opacity) * 0.1;
              }
            });
          }
        });
      }
    }
  });

  return (
    <group ref={group}>
      <ErrorBoundary>
        <group ref={gltfGroupRef} position={[0, 0, 200]} rotation={[0, 0, 0]} scale={150}>
          <GlbCharacterModel 
            key={devCharacterClass}
            characterId={devCharacterClass} 
            animationName={currentAnimation} 
          />
        </group>
      </ErrorBoundary>
      
      {/* Shadow blob */}
      <mesh position={[0, 0, 1]}>
        <circleGeometry args={[40, 32]} />
        <meshBasicMaterial color="black" transparent opacity={0.3} />
      </mesh>
      

    </group>
  );
}
