import React, { useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrthographicCamera } from '@react-three/drei';
import * as THREE from 'three';
import MapPlane from './MapPlane';
import GenericCharacter from './GenericCharacter';
import MapEffects from './MapEffects';
import MapPortals from './MapPortals';
import { useGameStore } from '../../game/store';

function CameraFollower() {
  const { player, mapImageSize } = useGameStore();
  const { camera } = useThree();

  useFrame(() => {
    if (mapImageSize.width === 0) return;

    // Follow player with easing
    const targetX = player.x;
    const targetY = -player.y;

    camera.position.x += (targetX - camera.position.x) * 0.1;
    camera.position.y += (targetY - camera.position.y) * 0.1;
    
    // Clamp to map bounds (assuming OrthographicCamera)
    // We need to know the view size, but let's just do a basic clamp if possible, 
    // or just let it roam. For simplicity, just follow.
  });

  return null;
}

export default function GameScene({ imageUrl }: { imageUrl: string }) {
  return (
    <Canvas shadows={{ type: THREE.PCFShadowMap }}>
      {/* 
        Orthographic Camera to show the 2D map without perspective distortion,
        but allowing 3D models to render on top. 
        We zoom out a bit (zoom=1 means 1 unit = 1 pixel).
      */}
      <OrthographicCamera 
        makeDefault 
        position={[0, 0, 500]} 
        zoom={0.7}
        near={-1000} 
        far={1000} 
      />
      
      <ambientLight intensity={0.9} />
      <directionalLight 
        position={[100, 100, 200]} 
        intensity={1.5} 
        castShadow 
        shadow-mapSize-width={1024} 
        shadow-mapSize-height={1024} 
      />

      <MapPlane imageUrl={imageUrl} />
      <MapPortals />
      <MapEffects />
      <GenericCharacter />
      <CameraFollower />
    </Canvas>
  );
}
