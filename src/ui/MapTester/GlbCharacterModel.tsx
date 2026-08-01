import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader, KTX2Loader, SkeletonUtils } from 'three-stdlib';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

let ktx2Loader: KTX2Loader | null = null;
let gltfLoader: GLTFLoader | null = null;

export function GlbCharacterModel({ 
  characterId, 
  animationName,
  colorOverride
}: { 
  characterId: string, 
  animationName: string,
  colorOverride?: string
}) {
  const group = useRef<THREE.Group>(null);
  const { gl } = useThree();
  
  const [charScene, setCharScene] = useState<THREE.Group | null>(null);
  const [internalAnimations, setInternalAnimations] = useState<THREE.AnimationClip[]>([]);
  const [externalAnimations, setExternalAnimations] = useState<THREE.AnimationClip[]>([]);
  const [error, setError] = useState<Error | null>(null);

  const characterUrl = characterId.includes('/') ? `/${characterId}.glb` : `/characters/${characterId}.glb`;
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
      setInternalAnimations(gltf.animations);
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
    // Check if animation is already internal
    let clip = internalAnimations.find(a => a.name === animationName);
    if (!clip && animationName.includes('attack') && internalAnimations.length > 0) {
      clip = internalAnimations[0]; // fallback for custom attack anims
    }
    
    if (clip) return; // No need to load external

    let active = true;
    if (!gltfLoader) return; 

    gltfLoader.load(animationUrl, (gltf) => {
      if (!active) return;
      setExternalAnimations(gltf.animations);
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
    if (clonedScene) {
      let clip = internalAnimations.find(a => a.name === animationName);
      
      if (!clip && animationName.includes('attack') && internalAnimations.length > 0) {
        clip = internalAnimations[0]; // Force first internal as attack if missing
      }
      
      if (!clip && externalAnimations.length > 0) {
        clip = externalAnimations.find(a => a.name === animationName) || externalAnimations[0];
      }

      if (clip) {
        const action = mixer.clipAction(clip, clonedScene);
        action.reset().fadeIn(0.2).play();
        return () => {
          action.fadeOut(0.2);
        };
      }
    }
  }, [animationName, internalAnimations, externalAnimations, clonedScene, mixer]);

  if (error) {
    throw error; // Let ErrorBoundary catch it
  }

  return (
    <group ref={group}>
      {clonedScene && <primitive object={clonedScene} />}
    </group>
  );
}
