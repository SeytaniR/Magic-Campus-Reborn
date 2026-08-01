import React, { useRef, useEffect, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../game/store';
import { getOverlayLevel } from '../../game/physics';
import * as THREE from 'three';
import { GlbCharacterModel } from './GlbCharacterModel';
import { ErrorBoundary } from './ErrorBoundary';

export default function GenericCharacter() {
  const group = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const gltfGroupRef = useRef<THREE.Group>(null);
  
  const { player, mapData, devCharacterClass, devAnimation } = useGameStore();

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
        <group ref={gltfGroupRef} position={[0, 0, 200]} rotation={[0, 0, 0]} scale={200}>
          <GlbCharacterModel 
            key={`${devCharacterClass}-${devAnimation}`}
            characterId={devCharacterClass} 
            animationName={devAnimation} 
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
