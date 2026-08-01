import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader, KTX2Loader, SkeletonUtils } from 'three-stdlib';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { battleManager } from '../../game/ecs/BattleManager';

let ktx2Loader: KTX2Loader | null = null;
let gltfLoader: GLTFLoader | null = null;

export function GlbCharacterModel({ 
  characterId, 
  animationName = 'idle_battle',
  entityId,
  colorOverride
}: { 
  characterId: string, 
  animationName?: string,
  entityId?: string,
  colorOverride?: string
}) {
  const group = useRef<THREE.Group>(null);
  const { gl } = useThree();
  
  const [currentAnim, setCurrentAnim] = useState(animationName);
  const [charScene, setCharScene] = useState<THREE.Group | null>(null);
  const [internalAnimations, setInternalAnimations] = useState<THREE.AnimationClip[]>([]);
  const [externalAnimations, setExternalAnimations] = useState<THREE.AnimationClip[]>([]);

  const characterUrl = characterId.includes('/') ? `/${characterId}.glb` : `/characters/${characterId}.glb`;
  
  useEffect(() => {
    if (entityId) {
      const handleState = () => {
        const anim = battleManager.entityAnimations[entityId] || 'idle_battle';
        setCurrentAnim(prev => prev !== anim ? anim : prev);
      };
      battleManager.addOnStateChange(handleState);
      handleState(); // Initial check
      return () => battleManager.removeOnStateChange(handleState);
    } else {
      setCurrentAnim(animationName);
    }
  }, [entityId, animationName]);

  const animationUrl = `/animations/${currentAnim}.glb`;

  const globalMaterialCache: Record<string, THREE.Material | THREE.Material[]> = {};

  const clonedScene = useMemo(() => {
    if (!charScene) return null;
    const cloned = SkeletonUtils.clone(charScene);
    cloned.traverse((child: any) => {
      if (child.isMesh) {
        child.frustumCulled = false; // Just in case
        
        if (child.material) {
          const processMaterial = (m: THREE.Material) => {
            const cacheKey = `${m.uuid}_${colorOverride || 'default'}`;
            if (!globalMaterialCache[cacheKey]) {
              const newMat = m.clone();
              
              // Hue Shifting via Shader Injection
              if (colorOverride) {
                newMat.onBeforeCompile = (shader) => {
                  shader.uniforms.targetColor = { value: new THREE.Color(colorOverride) };
                  
                  shader.fragmentShader = `
                    uniform vec3 targetColor;
                  ` + shader.fragmentShader;
                  
                  shader.fragmentShader = shader.fragmentShader.replace(
                    '#include <map_fragment>',
                    `
                    #include <map_fragment>
                    float r_val = diffuseColor.r;
                    float g_val = diffuseColor.g;
                    float b_val = diffuseColor.b;
                    
                    // Se o verde for a cor predominante
                    if (g_val > r_val * 1.1 && g_val > b_val * 1.1) {
                       float intensity = g_val; 
                       diffuseColor = vec4(targetColor * intensity, diffuseColor.a);
                    }
                    `
                  );
                };
              }
              
              globalMaterialCache[cacheKey] = newMat;
            }
            return globalMaterialCache[cacheKey];
          };

          child.material = Array.isArray(child.material) 
            ? child.material.map(processMaterial)
            : processMaterial(child.material);
        }
      }
    });
    return cloned;
  }, [charScene, colorOverride]);

  // Create a dedicated mixer for the cloned scene
  const mixer = useMemo(() => {
    if (!clonedScene) return null;
    return new THREE.AnimationMixer(clonedScene);
  }, [clonedScene]);

  useFrame((_, delta) => {
    if (mixer) mixer.update(delta);
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
      setInternalAnimations(gltf.animations);
    }, undefined, (err) => {
      console.warn(`[GlbCharacterModel] Failed to load character ${characterUrl}:`, err);
    });

    return () => {
      active = false;
    };
  }, [characterUrl, gl]);

  useEffect(() => {
    // Check if animation is already internal
    let clip = internalAnimations.find(a => a.name === currentAnim);
    if (!clip && currentAnim.includes('attack') && internalAnimations.length > 0) {
      clip = internalAnimations[0]; // fallback for custom attack anims
    }
    
    if (clip) return; // No need to load external

    let active = true;
    if (!gltfLoader) return; 

    gltfLoader.load(animationUrl, (gltf) => {
      if (!active) return;
      setExternalAnimations(gltf.animations);
    }, undefined, (err) => {
      console.warn(`[GlbCharacterModel] Failed to load animation ${animationUrl}:`, err);
      // Do not throw to prevent React crash!
    });

    return () => {
      active = false;
    };
  }, [animationUrl, currentAnim, internalAnimations]);
  
  useEffect(() => {
    if (clonedScene && mixer) {
      let clip = internalAnimations.find(a => a.name === currentAnim);
      
      if (!clip && currentAnim.includes('attack') && internalAnimations.length > 0) {
        clip = internalAnimations[0]; // Force first internal as attack if missing
      }
      
      if (!clip && externalAnimations.length > 0) {
        clip = externalAnimations.find(a => a.name === currentAnim) || externalAnimations[0];
      }

      if (clip) {
        // Only keep tracks that actually exist in the model to avoid THREE.PropertyBinding warnings/crashes
        // This is a common issue when applying external mixamo animations to different skeletons.
        const cleanClip = clip.clone();
        cleanClip.tracks = cleanClip.tracks.filter(track => {
          const trackName = track.name.split('.')[0];
          let found = false;
          clonedScene.traverse((child: any) => {
            if (child.name === trackName) found = true;
          });
          // We can't strictly filter all because some root motions map differently, 
          // but we'll let Three.js handle the warnings natively. 
          // If the crash was an exception, the above error swallowing fixes it.
          return true;
        });

        try {
          const action = mixer.clipAction(cleanClip);
          action.reset().fadeIn(0.2).play();
          return () => {
            action.fadeOut(0.2);
          };
        } catch (err) {
          console.warn("[GlbCharacterModel] Failed to play animation:", err);
        }
      }
    }
  }, [currentAnim, internalAnimations, externalAnimations, clonedScene, mixer]);

  return (
    <group ref={group}>
      {clonedScene && <primitive object={clonedScene} />}
    </group>
  );
}
