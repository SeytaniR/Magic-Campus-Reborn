import React, { useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../game/store';

export default function MapPlane({ imageUrl }: { imageUrl: string }) {
  const texture = useLoader(THREE.TextureLoader, imageUrl);
  const { mapImageSize } = useGameStore();

  const geometry = useMemo(() => {
    if (mapImageSize.width === 0) return null;
    // Map placed so top-left is 0,0, bottom-right is width, -height
    const geom = new THREE.PlaneGeometry(mapImageSize.width, mapImageSize.height);
    geom.translate(mapImageSize.width / 2, -mapImageSize.height / 2, 0);
    return geom;
  }, [mapImageSize]);

  if (!geometry) return null;

  return (
    <mesh geometry={geometry} position={[0, 0, 0]} receiveShadow>
      <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
    </mesh>
  );
}
