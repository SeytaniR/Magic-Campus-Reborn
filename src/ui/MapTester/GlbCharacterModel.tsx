import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import { useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader, KTX2Loader, SkeletonUtils } from 'three-stdlib';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

let ktx2Loader: KTX2Loader | null = null;
let gltfLoader: GLTFLoader | null = null;

export function GlbCharacterModel({ 
  characterId, 
  animationName 
}: { 
  characterId: string, 
  animationName: string 
}) {
  const group = useRef<THREE.Group>(null);
  const { gl } = useThree();
  
  const [charScene, setCharScene] = useState<THREE.Group | null>(null);
  const [animations, setAnimations] = useState<THREE.AnimationClip[]>([]);
  const [error, setError] = useState<Error | null>(null);

  const characterUrl = `/characters/${characterId}.glb`;
  const animationUrl = `/animations/${animationName}.glb`;

  useEffect(() => {
    let active = true;

    if (!ktx2Loader) {
      ktx2Loader = new KTX2Loader();
      ktx2Loader.setTranscoderPath('/basis/');
      ktx2Loader.detectSupport(gl);
    }
    
    if (!gltfLoader) {
      gltfLoader = new GLTFLoader();
      gltfLoader.setMeshoptDecoder(MeshoptDecoder);
      gltfLoader.setKTX2Loader(ktx2Loader);
    }

    Promise.all([
      new Promise<THREE.Group>((resolve, reject) => {
        gltfLoader!.load(characterUrl, (gltf) => {
          resolve(gltf.scene);
        }, undefined, reject);
      }),
      new Promise<THREE.AnimationClip[]>((resolve, reject) => {
        gltfLoader!.load(animationUrl, (gltf) => {
          resolve(gltf.animations);
        }, undefined, reject);
      })
    ]).then(([scene, anims]) => {
      if (!active) return;
      setCharScene(scene);
      setAnimations(anims);
      setError(null);
    }).catch(err => {
      console.error("Error loading GLTF:", err);
      if (active) setError(err);
    });

    return () => {
      active = false;
    };
  }, [characterUrl, animationUrl, gl]);

  const clonedScene = useMemo(() => {
    if (!charScene) return null;
    const cloned = SkeletonUtils.clone(charScene);
    cloned.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.frustumCulled = false; // Just in case
        
        // Fix transparency bugs by forcing materials to be transparent and cloned
        if (child.material) {
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          const clonedMats = mats.map(m => {
            const newMat = m.clone();
            newMat.transparent = true;
            newMat.needsUpdate = true;
            return newMat;
          });
          child.material = Array.isArray(child.material) ? clonedMats : clonedMats[0];
        }
      }
    });
    return cloned;
  }, [charScene]);
  
  const { actions, names } = useAnimations(animations, group);
  
  useEffect(() => {
    if (names.length > 0) {
      const actionName = names[0];
      const action = actions[actionName];
      if (action) {
        action.reset().fadeIn(0.2).play();
        return () => {
          action.fadeOut(0.2);
        };
      }
    }
  }, [animationName, actions, names]);

  if (error) {
    throw error; // Let ErrorBoundary catch it
  }

  return (
    <group ref={group}>
      {clonedScene && <primitive object={clonedScene} />}
    </group>
  );
}
