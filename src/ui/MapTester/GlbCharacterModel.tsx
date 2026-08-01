import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
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

  // Create a dedicated mixer for this component instance
  const mixer = useMemo(() => new THREE.AnimationMixer(null as any), []);

  useFrame((_, delta) => {
    mixer.update(delta);
  });

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

    gltfLoader.load(characterUrl, (gltf) => {
      if (!active) return;
      setCharScene(gltf.scene);
      setError(null);
    }, undefined, (err) => {
      console.error("Error loading character GLTF:", err);
      if (active) setError(err as Error);
    });

    return () => {
      active = false;
    };
  }, [characterUrl, gl]);

  useEffect(() => {
    let active = true;
    
    if (!gltfLoader) return; // Should be initialized by the other hook

    gltfLoader.load(animationUrl, (gltf) => {
      if (!active) return;
      setAnimations(gltf.animations);
      setError(null);
    }, undefined, (err) => {
      console.error("Error loading animation GLTF:", err);
      if (active) setError(err as Error);
    });

    return () => {
      active = false;
    };
  }, [animationUrl]);

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
  
  useEffect(() => {
    if (animations.length > 0 && clonedScene) {
      const clip = animations[0];
      const action = mixer.clipAction(clip, clonedScene);
      
      // We must tell the mixer to stop any lingering weights on this action if we reuse it
      action.reset().fadeIn(0.2).play();
      
      return () => {
        action.fadeOut(0.2);
      };
    }
  }, [animations, clonedScene, mixer]);

  if (error) {
    throw error; // Let ErrorBoundary catch it
  }

  return (
    <group ref={group}>
      {clonedScene && <primitive object={clonedScene} />}
    </group>
  );
}
